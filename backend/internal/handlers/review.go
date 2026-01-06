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

type ReviewHandler struct{}

func NewReviewHandler() *ReviewHandler {
	return &ReviewHandler{}
}

func (h *ReviewHandler) GetProductReviews(c *gin.Context) {
	productID := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	productObjectID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		utils.ValidationError(c, "Invalid product ID")
		return
	}

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := database.Reviews().Find(ctx, bson.M{"product_id": productObjectID}, opts)
	if err != nil {
		utils.InternalError(c, "Failed to fetch reviews")
		return
	}
	defer cursor.Close(ctx)

	var reviews []models.Review
	if err := cursor.All(ctx, &reviews); err != nil {
		utils.InternalError(c, "Failed to decode reviews")
		return
	}

	// Calculate average rating
	var totalRating float64
	for _, review := range reviews {
		totalRating += float64(review.Rating)
	}
	avgRating := 0.0
	if len(reviews) > 0 {
		avgRating = totalRating / float64(len(reviews))
	}

	utils.SuccessResponse(c, http.StatusOK, "", gin.H{
		"reviews":    reviews,
		"count":      len(reviews),
		"avgRating":  avgRating,
	})
}

func (h *ReviewHandler) CreateReview(c *gin.Context) {
	userID, _ := c.Get("userId")

	var input models.CreateReviewInput
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
	count, _ := database.Products().CountDocuments(ctx, bson.M{"_id": productID})
	if count == 0 {
		utils.NotFoundError(c, "Product not found")
		return
	}

	// Check if user has already reviewed
	existingCount, _ := database.Reviews().CountDocuments(ctx, bson.M{"product_id": productID, "user_id": objectID})
	if existingCount > 0 {
		utils.ErrorResponse(c, http.StatusConflict, "You have already reviewed this product")
		return
	}

	// Get user details
	var user models.User
	database.Users().FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)

	// Check if user has purchased this product (for verified review)
	purchaseCount, _ := database.Orders().CountDocuments(ctx, bson.M{
		"user_id":          objectID,
		"items.product_id": productID,
		"status":           models.OrderDelivered,
	})
	isVerified := purchaseCount > 0

	review := models.Review{
		ID:         primitive.NewObjectID(),
		ProductID:  productID,
		UserID:     objectID,
		UserName:   user.FirstName + " " + user.LastName,
		UserAvatar: user.Avatar,
		Rating:     input.Rating,
		Title:      input.Title,
		Comment:    input.Comment,
		Images:     input.Images,
		IsVerified: isVerified,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	_, err = database.Reviews().InsertOne(ctx, review)
	if err != nil {
		utils.InternalError(c, "Failed to create review")
		return
	}

	// Update product rating
	h.updateProductRating(ctx, productID)

	utils.SuccessResponse(c, http.StatusCreated, "Review created successfully", review)
}

func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	userID, _ := c.Get("userId")
	reviewID := c.Param("id")

	var input models.UpdateReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))
	reviewObjectID, err := primitive.ObjectIDFromHex(reviewID)
	if err != nil {
		utils.ValidationError(c, "Invalid review ID")
		return
	}

	var review models.Review
	err = database.Reviews().FindOne(ctx, bson.M{"_id": reviewObjectID, "user_id": objectID}).Decode(&review)
	if err != nil {
		utils.NotFoundError(c, "Review not found")
		return
	}

	update := bson.M{"updated_at": time.Now()}
	if input.Rating > 0 {
		update["rating"] = input.Rating
	}
	if input.Title != "" {
		update["title"] = input.Title
	}
	if input.Comment != "" {
		update["comment"] = input.Comment
	}
	if input.Images != nil {
		update["images"] = input.Images
	}

	_, err = database.Reviews().UpdateOne(ctx, bson.M{"_id": reviewObjectID}, bson.M{"$set": update})
	if err != nil {
		utils.InternalError(c, "Failed to update review")
		return
	}

	// Update product rating
	h.updateProductRating(ctx, review.ProductID)

	database.Reviews().FindOne(ctx, bson.M{"_id": reviewObjectID}).Decode(&review)

	utils.SuccessResponse(c, http.StatusOK, "Review updated successfully", review)
}

func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	userID, _ := c.Get("userId")
	userRole, _ := c.Get("userRole")
	reviewID := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))
	reviewObjectID, err := primitive.ObjectIDFromHex(reviewID)
	if err != nil {
		utils.ValidationError(c, "Invalid review ID")
		return
	}

	filter := bson.M{"_id": reviewObjectID}
	if userRole != models.RoleAdmin {
		filter["user_id"] = objectID
	}

	var review models.Review
	err = database.Reviews().FindOne(ctx, filter).Decode(&review)
	if err != nil {
		utils.NotFoundError(c, "Review not found")
		return
	}

	_, err = database.Reviews().DeleteOne(ctx, filter)
	if err != nil {
		utils.InternalError(c, "Failed to delete review")
		return
	}

	// Update product rating
	h.updateProductRating(ctx, review.ProductID)

	utils.SuccessResponse(c, http.StatusOK, "Review deleted successfully", nil)
}

func (h *ReviewHandler) updateProductRating(ctx context.Context, productID primitive.ObjectID) {
	cursor, err := database.Reviews().Find(ctx, bson.M{"product_id": productID})
	if err != nil {
		return
	}
	defer cursor.Close(ctx)

	var reviews []models.Review
	cursor.All(ctx, &reviews)

	var totalRating float64
	for _, review := range reviews {
		totalRating += float64(review.Rating)
	}

	avgRating := 0.0
	if len(reviews) > 0 {
		avgRating = totalRating / float64(len(reviews))
	}

	database.Products().UpdateOne(
		ctx,
		bson.M{"_id": productID},
		bson.M{"$set": bson.M{
			"rating":       avgRating,
			"review_count": len(reviews),
		}},
	)
}

