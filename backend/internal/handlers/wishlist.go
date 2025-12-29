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

type WishlistHandler struct{}

func NewWishlistHandler() *WishlistHandler {
	return &WishlistHandler{}
}

func (h *WishlistHandler) GetWishlist(c *gin.Context) {
	userID, _ := c.Get("userId")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))

	var wishlist models.Wishlist
	err := database.Wishlists().FindOne(ctx, bson.M{"user_id": objectID}).Decode(&wishlist)
	if err != nil {
		wishlist = models.Wishlist{
			UserID:   objectID,
			Products: []primitive.ObjectID{},
		}
	}

	// Get product details for wishlist items
	var products []models.WishlistProduct
	if len(wishlist.Products) > 0 {
		cursor, err := database.Products().Find(ctx, bson.M{"_id": bson.M{"$in": wishlist.Products}})
		if err == nil {
			defer cursor.Close(ctx)
			for cursor.Next(ctx) {
				var product models.Product
				cursor.Decode(&product)
				products = append(products, models.WishlistProduct{
					ID:            product.ID,
					Name:          product.Name,
					Thumbnail:     product.Thumbnail,
					BasePrice:     product.BasePrice,
					DiscountPrice: product.DiscountPrice,
					MetalType:     product.MetalType,
					IsActive:      product.IsActive,
					Stock:         product.Stock,
				})
			}
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "", gin.H{
		"products": products,
	})
}

func (h *WishlistHandler) AddToWishlist(c *gin.Context) {
	userID, _ := c.Get("userId")

	var input struct {
		ProductID string `json:"productId" binding:"required"`
	}
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

	// Check if product exists
	count, _ := database.Products().CountDocuments(ctx, bson.M{"_id": productID, "is_active": true})
	if count == 0 {
		utils.NotFoundError(c, "Product not found")
		return
	}

	// Add to wishlist
	opts := options.Update().SetUpsert(true)
	_, err = database.Wishlists().UpdateOne(
		ctx,
		bson.M{"user_id": objectID},
		bson.M{
			"$addToSet":   bson.M{"products": productID},
			"$set":        bson.M{"updated_at": time.Now()},
			"$setOnInsert": bson.M{"user_id": objectID},
		},
		opts,
	)
	if err != nil {
		utils.InternalError(c, "Failed to add to wishlist")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Added to wishlist", nil)
}

func (h *WishlistHandler) RemoveFromWishlist(c *gin.Context) {
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

	_, err = database.Wishlists().UpdateOne(
		ctx,
		bson.M{"user_id": objectID},
		bson.M{
			"$pull": bson.M{"products": productID},
			"$set":  bson.M{"updated_at": time.Now()},
		},
	)
	if err != nil {
		utils.InternalError(c, "Failed to remove from wishlist")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Removed from wishlist", nil)
}

func (h *WishlistHandler) ClearWishlist(c *gin.Context) {
	userID, _ := c.Get("userId")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))

	_, err := database.Wishlists().DeleteOne(ctx, bson.M{"user_id": objectID})
	if err != nil {
		utils.InternalError(c, "Failed to clear wishlist")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Wishlist cleared", nil)
}

