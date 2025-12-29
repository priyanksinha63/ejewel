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

type ProductHandler struct{}

func NewProductHandler() *ProductHandler {
	return &ProductHandler{}
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	var filter models.ProductFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 12
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := bson.M{"is_active": true}

	if filter.MetalType != "" {
		query["metal_type"] = filter.MetalType
	}
	if filter.CategoryID != "" {
		catID, _ := primitive.ObjectIDFromHex(filter.CategoryID)
		query["category_id"] = catID
	}
	if filter.MinPrice > 0 {
		query["base_price"] = bson.M{"$gte": filter.MinPrice}
	}
	if filter.MaxPrice > 0 {
		if _, ok := query["base_price"]; ok {
			query["base_price"].(bson.M)["$lte"] = filter.MaxPrice
		} else {
			query["base_price"] = bson.M{"$lte": filter.MaxPrice}
		}
	}
	if filter.Purity != "" {
		query["purity"] = filter.Purity
	}
	if filter.Search != "" {
		query["$or"] = []bson.M{
			{"name": bson.M{"$regex": filter.Search, "$options": "i"}},
			{"description": bson.M{"$regex": filter.Search, "$options": "i"}},
			{"tags": bson.M{"$regex": filter.Search, "$options": "i"}},
		}
	}
	if filter.IsFeatured == "true" {
		query["is_featured"] = true
	}

	// Sorting
	sortField := "created_at"
	sortOrder := -1
	if filter.SortBy != "" {
		switch filter.SortBy {
		case "price":
			sortField = "base_price"
		case "name":
			sortField = "name"
		case "rating":
			sortField = "rating"
		case "newest":
			sortField = "created_at"
		}
	}
	if filter.SortOrder == "asc" {
		sortOrder = 1
	}

	skip := int64((filter.Page - 1) * filter.Limit)
	limit := int64(filter.Limit)

	opts := options.Find().
		SetSort(bson.D{{Key: sortField, Value: sortOrder}}).
		SetSkip(skip).
		SetLimit(limit)

	cursor, err := database.Products().Find(ctx, query, opts)
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

	total, _ := database.Products().CountDocuments(ctx, query)

	utils.PaginatedSuccessResponse(c, products, filter.Page, filter.Limit, total)
}

func (h *ProductHandler) GetProduct(c *gin.Context) {
	idParam := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var product models.Product

	// Try to find by ID first, then by slug
	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err == nil {
		err = database.Products().FindOne(ctx, bson.M{"_id": objectID}).Decode(&product)
	} else {
		err = database.Products().FindOne(ctx, bson.M{"slug": idParam}).Decode(&product)
	}

	if err != nil {
		utils.NotFoundError(c, "Product not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", product)
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var input models.CreateProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	userID, _ := c.Get("userId")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	categoryID, _ := primitive.ObjectIDFromHex(input.CategoryID)
	sellerID, _ := primitive.ObjectIDFromHex(userID.(string))

	// Get category name
	var category models.Category
	database.Categories().FindOne(ctx, bson.M{"_id": categoryID}).Decode(&category)

	discountPrice := utils.CalculateDiscountPrice(input.BasePrice, input.DiscountPercent)

	product := models.Product{
		ID:              primitive.NewObjectID(),
		Name:            input.Name,
		Slug:            utils.GenerateSlug(input.Name),
		Description:     input.Description,
		ShortDesc:       input.ShortDesc,
		MetalType:       input.MetalType,
		Purity:          input.Purity,
		CategoryID:      categoryID,
		CategoryName:    category.Name,
		Images:          input.Images,
		Thumbnail:       input.Thumbnail,
		BasePrice:       input.BasePrice,
		DiscountPrice:   discountPrice,
		DiscountPercent: input.DiscountPercent,
		Variants:        input.Variants,
		Tags:            input.Tags,
		Features:        input.Features,
		IsFeatured:      input.IsFeatured,
		IsNewArrival:    input.IsNewArrival,
		IsActive:        true,
		Stock:           input.Stock,
		SellerID:        sellerID,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Generate IDs for variants
	for i := range product.Variants {
		if product.Variants[i].ID.IsZero() {
			product.Variants[i].ID = primitive.NewObjectID()
		}
	}

	_, err := database.Products().InsertOne(ctx, product)
	if err != nil {
		utils.InternalError(c, "Failed to create product")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Product created successfully", product)
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.ValidationError(c, "Invalid product ID")
		return
	}

	var input models.UpdateProductInput
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
	if input.ShortDesc != "" {
		update["short_desc"] = input.ShortDesc
	}
	if input.MetalType != "" {
		update["metal_type"] = input.MetalType
	}
	if input.Purity != "" {
		update["purity"] = input.Purity
	}
	if input.CategoryID != "" {
		catID, _ := primitive.ObjectIDFromHex(input.CategoryID)
		update["category_id"] = catID
		var category models.Category
		database.Categories().FindOne(ctx, bson.M{"_id": catID}).Decode(&category)
		update["category_name"] = category.Name
	}
	if input.Images != nil {
		update["images"] = input.Images
	}
	if input.Thumbnail != "" {
		update["thumbnail"] = input.Thumbnail
	}
	if input.BasePrice > 0 {
		update["base_price"] = input.BasePrice
		update["discount_price"] = utils.CalculateDiscountPrice(input.BasePrice, input.DiscountPercent)
	}
	if input.DiscountPercent >= 0 {
		update["discount_percent"] = input.DiscountPercent
		if basePrice, ok := update["base_price"].(float64); ok {
			update["discount_price"] = utils.CalculateDiscountPrice(basePrice, input.DiscountPercent)
		}
	}
	if input.Variants != nil {
		for i := range input.Variants {
			if input.Variants[i].ID.IsZero() {
				input.Variants[i].ID = primitive.NewObjectID()
			}
		}
		update["variants"] = input.Variants
	}
	if input.Tags != nil {
		update["tags"] = input.Tags
	}
	if input.Features != nil {
		update["features"] = input.Features
	}
	update["is_featured"] = input.IsFeatured
	update["is_new_arrival"] = input.IsNewArrival
	update["is_best_seller"] = input.IsBestSeller
	update["is_active"] = input.IsActive
	update["stock"] = input.Stock

	_, err = database.Products().UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": update})
	if err != nil {
		utils.InternalError(c, "Failed to update product")
		return
	}

	var product models.Product
	database.Products().FindOne(ctx, bson.M{"_id": objectID}).Decode(&product)

	utils.SuccessResponse(c, http.StatusOK, "Product updated successfully", product)
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.ValidationError(c, "Invalid product ID")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = database.Products().DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		utils.InternalError(c, "Failed to delete product")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Product deleted successfully", nil)
}

func (h *ProductHandler) GetFeaturedProducts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetLimit(8).SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := database.Products().Find(ctx, bson.M{"is_featured": true, "is_active": true}, opts)
	if err != nil {
		utils.InternalError(c, "Failed to fetch featured products")
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err := cursor.All(ctx, &products); err != nil {
		utils.InternalError(c, "Failed to decode products")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", products)
}

func (h *ProductHandler) GetNewArrivals(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetLimit(8).SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := database.Products().Find(ctx, bson.M{"is_new_arrival": true, "is_active": true}, opts)
	if err != nil {
		utils.InternalError(c, "Failed to fetch new arrivals")
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err := cursor.All(ctx, &products); err != nil {
		utils.InternalError(c, "Failed to decode products")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", products)
}

func (h *ProductHandler) GetBestSellers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetLimit(8).SetSort(bson.D{{Key: "review_count", Value: -1}})
	cursor, err := database.Products().Find(ctx, bson.M{"is_best_seller": true, "is_active": true}, opts)
	if err != nil {
		utils.InternalError(c, "Failed to fetch best sellers")
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err := cursor.All(ctx, &products); err != nil {
		utils.InternalError(c, "Failed to decode products")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", products)
}

func (h *ProductHandler) SearchProducts(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		utils.ValidationError(c, "Search query is required")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"is_active": true,
		"$or": []bson.M{
			{"name": bson.M{"$regex": query, "$options": "i"}},
			{"description": bson.M{"$regex": query, "$options": "i"}},
			{"tags": bson.M{"$regex": query, "$options": "i"}},
			{"category_name": bson.M{"$regex": query, "$options": "i"}},
		},
	}

	opts := options.Find().SetLimit(20)
	cursor, err := database.Products().Find(ctx, filter, opts)
	if err != nil {
		utils.InternalError(c, "Failed to search products")
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err := cursor.All(ctx, &products); err != nil {
		utils.InternalError(c, "Failed to decode products")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", products)
}

