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

type OrderHandler struct{}

func NewOrderHandler() *OrderHandler {
	return &OrderHandler{}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	userID, _ := c.Get("userId")

	var input models.CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))

	// Get user details
	var user models.User
	err := database.Users().FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		utils.NotFoundError(c, "User not found")
		return
	}

	// Find the address
	var shippingAddress models.Address
	addressID, _ := primitive.ObjectIDFromHex(input.AddressID)
	for _, addr := range user.Addresses {
		if addr.ID == addressID {
			shippingAddress = addr
			break
		}
	}

	if shippingAddress.Street == "" {
		utils.ValidationError(c, "Invalid address")
		return
	}

	// Get cart
	var cart models.Cart
	err = database.Carts().FindOne(ctx, bson.M{"user_id": objectID}).Decode(&cart)
	if err != nil || len(cart.Items) == 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Cart is empty")
		return
	}

	// Convert cart items to order items
	var orderItems []models.OrderItem
	for _, item := range cart.Items {
		orderItems = append(orderItems, models.OrderItem{
			ProductID:   item.ProductID,
			ProductName: item.ProductName,
			Thumbnail:   item.Thumbnail,
			VariantID:   item.VariantID,
			Size:        item.Size,
			Quantity:    item.Quantity,
			Price:       item.Price,
			TotalPrice:  item.Price * float64(item.Quantity),
		})
	}

	// Calculate totals
	subtotal := cart.Total
	tax := subtotal * 0.18 // 18% GST
	shippingCost := 0.0
	if subtotal < 5000 {
		shippingCost = 199
	}
	total := subtotal + tax + shippingCost

	order := models.Order{
		ID:          primitive.NewObjectID(),
		OrderNumber: utils.GenerateOrderNumber(),
		UserID:      objectID,
		UserEmail:   user.Email,
		UserName:    user.FirstName + " " + user.LastName,
		Items:       orderItems,
		Subtotal:    subtotal,
		Tax:         tax,
		Discount:    0,
		CouponCode:  input.CouponCode,
		ShippingInfo: models.ShippingInfo{
			Address: shippingAddress,
			Method:  input.ShippingMethod,
			Cost:    shippingCost,
		},
		PaymentInfo: models.PaymentInfo{
			Method: input.PaymentMethod,
			Status: models.PaymentPending,
		},
		Total:     total,
		Status:    models.OrderPending,
		Notes:     input.Notes,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// If COD, mark as confirmed
	if input.PaymentMethod == models.PaymentCOD {
		order.Status = models.OrderConfirmed
	}

	_, err = database.Orders().InsertOne(ctx, order)
	if err != nil {
		utils.InternalError(c, "Failed to create order")
		return
	}

	// Clear cart
	database.Carts().DeleteOne(ctx, bson.M{"user_id": objectID})

	// Update product stock
	for _, item := range cart.Items {
		database.Products().UpdateOne(
			ctx,
			bson.M{"_id": item.ProductID},
			bson.M{"$inc": bson.M{"stock": -item.Quantity}},
		)
	}

	utils.SuccessResponse(c, http.StatusCreated, "Order placed successfully", order)
}

func (h *OrderHandler) GetOrders(c *gin.Context) {
	userID, _ := c.Get("userId")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := database.Orders().Find(ctx, bson.M{"user_id": objectID}, opts)
	if err != nil {
		utils.InternalError(c, "Failed to fetch orders")
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err := cursor.All(ctx, &orders); err != nil {
		utils.InternalError(c, "Failed to decode orders")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", orders)
}

func (h *OrderHandler) GetOrder(c *gin.Context) {
	userID, _ := c.Get("userId")
	orderID := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))
	orderObjectID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		utils.ValidationError(c, "Invalid order ID")
		return
	}

	var order models.Order
	err = database.Orders().FindOne(ctx, bson.M{"_id": orderObjectID, "user_id": objectID}).Decode(&order)
	if err != nil {
		utils.NotFoundError(c, "Order not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", order)
}

func (h *OrderHandler) CancelOrder(c *gin.Context) {
	userID, _ := c.Get("userId")
	orderID := c.Param("id")

	var input struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&input)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))
	orderObjectID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		utils.ValidationError(c, "Invalid order ID")
		return
	}

	var order models.Order
	err = database.Orders().FindOne(ctx, bson.M{"_id": orderObjectID, "user_id": objectID}).Decode(&order)
	if err != nil {
		utils.NotFoundError(c, "Order not found")
		return
	}

	if order.Status != models.OrderPending && order.Status != models.OrderConfirmed {
		utils.ErrorResponse(c, http.StatusBadRequest, "Order cannot be cancelled")
		return
	}

	_, err = database.Orders().UpdateOne(
		ctx,
		bson.M{"_id": orderObjectID},
		bson.M{"$set": bson.M{
			"status":        models.OrderCancelled,
			"cancel_reason": input.Reason,
			"updated_at":    time.Now(),
		}},
	)
	if err != nil {
		utils.InternalError(c, "Failed to cancel order")
		return
	}

	// Restore product stock
	for _, item := range order.Items {
		database.Products().UpdateOne(
			ctx,
			bson.M{"_id": item.ProductID},
			bson.M{"$inc": bson.M{"stock": item.Quantity}},
		)
	}

	utils.SuccessResponse(c, http.StatusOK, "Order cancelled successfully", nil)
}

// Admin handlers

func (h *OrderHandler) GetAllOrders(c *gin.Context) {
	page := 1
	limit := 20
	status := c.Query("status")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}

	skip := int64((page - 1) * limit)
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cursor, err := database.Orders().Find(ctx, filter, opts)
	if err != nil {
		utils.InternalError(c, "Failed to fetch orders")
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err := cursor.All(ctx, &orders); err != nil {
		utils.InternalError(c, "Failed to decode orders")
		return
	}

	total, _ := database.Orders().CountDocuments(ctx, filter)

	utils.PaginatedSuccessResponse(c, orders, page, limit, total)
}

func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")

	var input models.UpdateOrderStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	orderObjectID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		utils.ValidationError(c, "Invalid order ID")
		return
	}

	update := bson.M{
		"status":     input.Status,
		"updated_at": time.Now(),
	}

	if input.TrackingID != "" {
		update["shipping_info.tracking_id"] = input.TrackingID
	}
	if input.Carrier != "" {
		update["shipping_info.carrier"] = input.Carrier
	}
	if input.CancelReason != "" {
		update["cancel_reason"] = input.CancelReason
	}

	// If delivered, update payment status
	if input.Status == models.OrderDelivered {
		update["payment_info.status"] = models.PaymentCompleted
		update["payment_info.paid_at"] = time.Now()
	}

	_, err = database.Orders().UpdateOne(ctx, bson.M{"_id": orderObjectID}, bson.M{"$set": update})
	if err != nil {
		utils.InternalError(c, "Failed to update order")
		return
	}

	var order models.Order
	database.Orders().FindOne(ctx, bson.M{"_id": orderObjectID}).Decode(&order)

	utils.SuccessResponse(c, http.StatusOK, "Order status updated", order)
}

