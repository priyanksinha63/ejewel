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

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get counts
	totalProducts, _ := database.Products().CountDocuments(ctx, bson.M{})
	activeProducts, _ := database.Products().CountDocuments(ctx, bson.M{"is_active": true})
	totalUsers, _ := database.Users().CountDocuments(ctx, bson.M{})
	totalOrders, _ := database.Orders().CountDocuments(ctx, bson.M{})
	pendingOrders, _ := database.Orders().CountDocuments(ctx, bson.M{"status": models.OrderPending})
	processingOrders, _ := database.Orders().CountDocuments(ctx, bson.M{"status": models.OrderProcessing})
	deliveredOrders, _ := database.Orders().CountDocuments(ctx, bson.M{"status": models.OrderDelivered})

	// Get total revenue
	pipeline := []bson.M{
		{"$match": bson.M{"status": bson.M{"$in": []models.OrderStatus{models.OrderDelivered, models.OrderShipped}}}},
		{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$total"}}},
	}
	cursor, _ := database.Orders().Aggregate(ctx, pipeline)
	var revenueResult []bson.M
	cursor.All(ctx, &revenueResult)
	totalRevenue := 0.0
	if len(revenueResult) > 0 {
		if val, ok := revenueResult[0]["total"].(float64); ok {
			totalRevenue = val
		}
	}

	// Get today's stats
	today := time.Now().Truncate(24 * time.Hour)
	todayOrders, _ := database.Orders().CountDocuments(ctx, bson.M{"created_at": bson.M{"$gte": today}})
	
	todayPipeline := []bson.M{
		{"$match": bson.M{"created_at": bson.M{"$gte": today}}},
		{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$total"}}},
	}
	cursor, _ = database.Orders().Aggregate(ctx, todayPipeline)
	var todayRevenueResult []bson.M
	cursor.All(ctx, &todayRevenueResult)
	todayRevenue := 0.0
	if len(todayRevenueResult) > 0 {
		if val, ok := todayRevenueResult[0]["total"].(float64); ok {
			todayRevenue = val
		}
	}

	// Get recent orders
	recentOrdersOpts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(10)
	recentOrdersCursor, _ := database.Orders().Find(ctx, bson.M{}, recentOrdersOpts)
	var recentOrders []models.Order
	recentOrdersCursor.All(ctx, &recentOrders)

	// Get low stock products
	lowStockOpts := options.Find().SetLimit(10)
	lowStockCursor, _ := database.Products().Find(ctx, bson.M{"stock": bson.M{"$lt": 10}, "is_active": true}, lowStockOpts)
	var lowStockProducts []models.Product
	lowStockCursor.All(ctx, &lowStockProducts)

	// Get monthly revenue for chart
	startOfMonth := time.Date(time.Now().Year(), time.Now().Month()-5, 1, 0, 0, 0, 0, time.UTC)
	monthlyPipeline := []bson.M{
		{"$match": bson.M{"created_at": bson.M{"$gte": startOfMonth}}},
		{"$group": bson.M{
			"_id": bson.M{
				"year":  bson.M{"$year": "$created_at"},
				"month": bson.M{"$month": "$created_at"},
			},
			"revenue": bson.M{"$sum": "$total"},
			"orders":  bson.M{"$sum": 1},
		}},
		{"$sort": bson.M{"_id.year": 1, "_id.month": 1}},
	}
	monthlyCursor, _ := database.Orders().Aggregate(ctx, monthlyPipeline)
	var monthlyStats []bson.M
	monthlyCursor.All(ctx, &monthlyStats)

	utils.SuccessResponse(c, http.StatusOK, "", gin.H{
		"overview": gin.H{
			"totalProducts":    totalProducts,
			"activeProducts":   activeProducts,
			"totalUsers":       totalUsers,
			"totalOrders":      totalOrders,
			"pendingOrders":    pendingOrders,
			"processingOrders": processingOrders,
			"deliveredOrders":  deliveredOrders,
			"totalRevenue":     totalRevenue,
			"todayOrders":      todayOrders,
			"todayRevenue":     todayRevenue,
		},
		"recentOrders":     recentOrders,
		"lowStockProducts": lowStockProducts,
		"monthlyStats":     monthlyStats,
	})
}

func (h *AdminHandler) GetUsers(c *gin.Context) {
	page := 1
	limit := 20
	role := c.Query("role")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	if role != "" {
		filter["role"] = role
	}

	skip := int64((page - 1) * limit)
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cursor, err := database.Users().Find(ctx, filter, opts)
	if err != nil {
		utils.InternalError(c, "Failed to fetch users")
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
		utils.InternalError(c, "Failed to decode users")
		return
	}

	total, _ := database.Users().CountDocuments(ctx, filter)

	utils.PaginatedSuccessResponse(c, users, page, limit, total)
}

func (h *AdminHandler) GetUser(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.ValidationError(c, "Invalid user ID")
		return
	}

	var user models.User
	err = database.Users().FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		utils.NotFoundError(c, "User not found")
		return
	}

	// Get user's orders
	ordersCursor, _ := database.Orders().Find(ctx, bson.M{"user_id": objectID}, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(10))
	var orders []models.Order
	ordersCursor.All(ctx, &orders)

	utils.SuccessResponse(c, http.StatusOK, "", gin.H{
		"user":   user,
		"orders": orders,
	})
}

func (h *AdminHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Role     models.Role `json:"role"`
		IsActive bool        `json:"isActive"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.ValidationError(c, "Invalid user ID")
		return
	}

	update := bson.M{
		"role":       input.Role,
		"is_active":  input.IsActive,
		"updated_at": time.Now(),
	}

	_, err = database.Users().UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": update})
	if err != nil {
		utils.InternalError(c, "Failed to update user")
		return
	}

	var user models.User
	database.Users().FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)

	utils.SuccessResponse(c, http.StatusOK, "User updated successfully", user)
}

func (h *AdminHandler) GetAllProducts(c *gin.Context) {
	page := 1
	limit := 20

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	skip := int64((page - 1) * limit)
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(limit))

	cursor, err := database.Products().Find(ctx, bson.M{}, opts)
	if err != nil {
		utils.InternalError(c, "Failed to fetch products")
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err := cursor.All(ctx, &products); err != nil {
		utils.InternalError(c, "Failed to decode products")
		return
	}

	total, _ := database.Products().CountDocuments(ctx, bson.M{})

	utils.PaginatedSuccessResponse(c, products, page, limit, total)
}

