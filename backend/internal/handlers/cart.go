package handlers

import (
	"context"
	"net/http"
	"time"

	"ejewel/internal/database"
	"ejewel/internal/models"
	"ejewel/internal/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CartHandler struct{}

func NewCartHandler() *CartHandler {
	return &CartHandler{}
}

func (h *CartHandler) GetCart(c *gin.Context) {
	userID, _ := c.Get("userId")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))

	var cart models.Cart
	err := database.Carts().FindOne(ctx, bson.M{"user_id": objectID}).Decode(&cart)
	if err != nil {
		// Return empty cart if not found
		cart = models.Cart{
			UserID: objectID,
			Items:  []models.CartItem{},
			Total:  0,
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "", cart)
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	userID, _ := c.Get("userId")

	var input models.AddToCartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))
	productID, err := primitive.ObjectIDFromHex(input.ProductID)
	if err != nil {
		utils.ValidationError(c, "Invalid product ID")
		return
	}

	// Get product details
	var product models.Product
	err = database.Products().FindOne(ctx, bson.M{"_id": productID, "is_active": true}).Decode(&product)
	if err != nil {
		utils.NotFoundError(c, "Product not found")
		return
	}

	// Get or create cart
	var cart models.Cart
	err = database.Carts().FindOne(ctx, bson.M{"user_id": objectID}).Decode(&cart)
	if err != nil {
		cart = models.Cart{
			ID:        primitive.NewObjectID(),
			UserID:    objectID,
			Items:     []models.CartItem{},
			UpdatedAt: time.Now(),
		}
	}

	// Calculate price
	price := product.DiscountPrice
	if price == 0 {
		price = product.BasePrice
	}

	// Check if variant is specified
	var variantID primitive.ObjectID
	var size string
	if input.VariantID != "" {
		variantID, _ = primitive.ObjectIDFromHex(input.VariantID)
		for _, v := range product.Variants {
			if v.ID == variantID {
				price = v.Price
				size = v.Size
				break
			}
		}
	}

	// Check if item already in cart
	found := false
	for i, item := range cart.Items {
		if item.ProductID == productID && item.VariantID == variantID {
			cart.Items[i].Quantity += input.Quantity
			found = true
			break
		}
	}

	if !found {
		cartItem := models.CartItem{
			ProductID:   productID,
			ProductName: product.Name,
			Thumbnail:   product.Thumbnail,
			VariantID:   variantID,
			Size:        size,
			Price:       price,
			Quantity:    input.Quantity,
			AddedAt:     time.Now(),
		}
		cart.Items = append(cart.Items, cartItem)
	}

	// Calculate total
	cart.Total = 0
	for _, item := range cart.Items {
		cart.Total += item.Price * float64(item.Quantity)
	}
	cart.UpdatedAt = time.Now()

	// Upsert cart
	opts := options.Update().SetUpsert(true)
	_, err = database.Carts().UpdateOne(ctx, bson.M{"user_id": objectID}, bson.M{"$set": cart}, opts)
	if err != nil {
		utils.InternalError(c, "Failed to update cart")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Item added to cart", cart)
}

func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	userID, _ := c.Get("userId")
	productIDParam := c.Param("productId")

	var input models.UpdateCartItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))
	productID, err := primitive.ObjectIDFromHex(productIDParam)
	if err != nil {
		utils.ValidationError(c, "Invalid product ID")
		return
	}

	var cart models.Cart
	err = database.Carts().FindOne(ctx, bson.M{"user_id": objectID}).Decode(&cart)
	if err != nil {
		utils.NotFoundError(c, "Cart not found")
		return
	}

	// Update or remove item
	newItems := []models.CartItem{}
	for _, item := range cart.Items {
		if item.ProductID == productID {
			if input.Quantity > 0 {
				item.Quantity = input.Quantity
				newItems = append(newItems, item)
			}
			// If quantity is 0, item is removed
		} else {
			newItems = append(newItems, item)
		}
	}

	cart.Items = newItems

	// Calculate total
	cart.Total = 0
	for _, item := range cart.Items {
		cart.Total += item.Price * float64(item.Quantity)
	}
	cart.UpdatedAt = time.Now()

	_, err = database.Carts().UpdateOne(ctx, bson.M{"user_id": objectID}, bson.M{"$set": cart})
	if err != nil {
		utils.InternalError(c, "Failed to update cart")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Cart updated", cart)
}

func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	userID, _ := c.Get("userId")
	productIDParam := c.Param("productId")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))
	productID, err := primitive.ObjectIDFromHex(productIDParam)
	if err != nil {
		utils.ValidationError(c, "Invalid product ID")
		return
	}

	var cart models.Cart
	err = database.Carts().FindOne(ctx, bson.M{"user_id": objectID}).Decode(&cart)
	if err != nil {
		utils.NotFoundError(c, "Cart not found")
		return
	}

	newItems := []models.CartItem{}
	for _, item := range cart.Items {
		if item.ProductID != productID {
			newItems = append(newItems, item)
		}
	}

	cart.Items = newItems

	// Calculate total
	cart.Total = 0
	for _, item := range cart.Items {
		cart.Total += item.Price * float64(item.Quantity)
	}
	cart.UpdatedAt = time.Now()

	_, err = database.Carts().UpdateOne(ctx, bson.M{"user_id": objectID}, bson.M{"$set": cart})
	if err != nil {
		utils.InternalError(c, "Failed to update cart")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Item removed from cart", cart)
}

func (h *CartHandler) ClearCart(c *gin.Context) {
	userID, _ := c.Get("userId")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))

	_, err := database.Carts().DeleteOne(ctx, bson.M{"user_id": objectID})
	if err != nil {
		utils.InternalError(c, "Failed to clear cart")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Cart cleared", nil)
}

