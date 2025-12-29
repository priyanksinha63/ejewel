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

type CategoryHandler struct{}

func NewCategoryHandler() *CategoryHandler {
	return &CategoryHandler{}
}

func (h *CategoryHandler) GetCategories(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "sort_order", Value: 1}})
	cursor, err := database.Categories().Find(ctx, bson.M{"is_active": true}, opts)
	if err != nil {
		utils.InternalError(c, "Failed to fetch categories")
		return
	}
	defer cursor.Close(ctx)

	var categories []models.Category
	if err := cursor.All(ctx, &categories); err != nil {
		utils.InternalError(c, "Failed to decode categories")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", categories)
}

func (h *CategoryHandler) GetCategory(c *gin.Context) {
	idParam := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var category models.Category

	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err == nil {
		err = database.Categories().FindOne(ctx, bson.M{"_id": objectID}).Decode(&category)
	} else {
		err = database.Categories().FindOne(ctx, bson.M{"slug": idParam}).Decode(&category)
	}

	if err != nil {
		utils.NotFoundError(c, "Category not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", category)
}

func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var input models.CreateCategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	category := models.Category{
		ID:          primitive.NewObjectID(),
		Name:        input.Name,
		Slug:        utils.GenerateSlug(input.Name),
		Description: input.Description,
		Image:       input.Image,
		Icon:        input.Icon,
		IsActive:    true,
		SortOrder:   input.SortOrder,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if input.ParentID != "" {
		parentID, _ := primitive.ObjectIDFromHex(input.ParentID)
		category.ParentID = parentID
	}

	_, err := database.Categories().InsertOne(ctx, category)
	if err != nil {
		utils.InternalError(c, "Failed to create category")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Category created successfully", category)
}

func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.ValidationError(c, "Invalid category ID")
		return
	}

	var input models.UpdateCategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{"updated_at": time.Now()}

	if input.Name != "" {
		update["name"] = input.Name
		update["slug"] = utils.GenerateSlug(input.Name)
	}
	if input.Description != "" {
		update["description"] = input.Description
	}
	if input.Image != "" {
		update["image"] = input.Image
	}
	if input.Icon != "" {
		update["icon"] = input.Icon
	}
	if input.ParentID != "" {
		parentID, _ := primitive.ObjectIDFromHex(input.ParentID)
		update["parent_id"] = parentID
	}
	update["is_active"] = input.IsActive
	update["sort_order"] = input.SortOrder

	_, err = database.Categories().UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": update})
	if err != nil {
		utils.InternalError(c, "Failed to update category")
		return
	}

	var category models.Category
	database.Categories().FindOne(ctx, bson.M{"_id": objectID}).Decode(&category)

	utils.SuccessResponse(c, http.StatusOK, "Category updated successfully", category)
}

func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.ValidationError(c, "Invalid category ID")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if any products are using this category
	count, _ := database.Products().CountDocuments(ctx, bson.M{"category_id": objectID})
	if count > 0 {
		utils.ErrorResponse(c, http.StatusConflict, "Cannot delete category with existing products")
		return
	}

	_, err = database.Categories().DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		utils.InternalError(c, "Failed to delete category")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Category deleted successfully", nil)
}

