package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MetalType string

const (
	MetalGold     MetalType = "gold"
	MetalSilver   MetalType = "silver"
	MetalPlatinum MetalType = "platinum"
	MetalRoseGold MetalType = "rose_gold"
)

type ProductVariant struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Size      string             `bson:"size" json:"size"`
	Weight    float64            `bson:"weight" json:"weight"` // in grams
	Price     float64            `bson:"price" json:"price"`
	Stock     int                `bson:"stock" json:"stock"`
	SKU       string             `bson:"sku" json:"sku"`
	IsDefault bool               `bson:"is_default" json:"isDefault"`
}

type Product struct {
	ID             primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name           string               `bson:"name" json:"name"`
	Slug           string               `bson:"slug" json:"slug"`
	Description    string               `bson:"description" json:"description"`
	ShortDesc      string               `bson:"short_desc" json:"shortDesc"`
	MetalType      MetalType            `bson:"metal_type" json:"metalType"`
	Purity         string               `bson:"purity" json:"purity"` // 22K, 24K, 925 Sterling, etc.
	CategoryID     primitive.ObjectID   `bson:"category_id" json:"categoryId"`
	CategoryName   string               `bson:"category_name" json:"categoryName"`
	Images         []string             `bson:"images" json:"images"`
	Thumbnail      string               `bson:"thumbnail" json:"thumbnail"`
	BasePrice      float64              `bson:"base_price" json:"basePrice"`
	DiscountPrice  float64              `bson:"discount_price" json:"discountPrice"`
	DiscountPercent float64             `bson:"discount_percent" json:"discountPercent"`
	Variants       []ProductVariant     `bson:"variants" json:"variants"`
	Tags           []string             `bson:"tags" json:"tags"`
	Features       []string             `bson:"features" json:"features"`
	IsFeatured     bool                 `bson:"is_featured" json:"isFeatured"`
	IsNewArrival   bool                 `bson:"is_new_arrival" json:"isNewArrival"`
	IsBestSeller   bool                 `bson:"is_best_seller" json:"isBestSeller"`
	IsActive       bool                 `bson:"is_active" json:"isActive"`
	Stock          int                  `bson:"stock" json:"stock"`
	Rating         float64              `bson:"rating" json:"rating"`
	ReviewCount    int                  `bson:"review_count" json:"reviewCount"`
	SellerID       primitive.ObjectID   `bson:"seller_id" json:"sellerId"`
	CreatedAt      time.Time            `bson:"created_at" json:"createdAt"`
	UpdatedAt      time.Time            `bson:"updated_at" json:"updatedAt"`
}

type CreateProductInput struct {
	Name            string           `json:"name" binding:"required"`
	Description     string           `json:"description" binding:"required"`
	ShortDesc       string           `json:"shortDesc"`
	MetalType       MetalType        `json:"metalType" binding:"required"`
	Purity          string           `json:"purity" binding:"required"`
	CategoryID      string           `json:"categoryId" binding:"required"`
	Images          []string         `json:"images"`
	Thumbnail       string           `json:"thumbnail"`
	BasePrice       float64          `json:"basePrice" binding:"required"`
	DiscountPercent float64          `json:"discountPercent"`
	Variants        []ProductVariant `json:"variants"`
	Tags            []string         `json:"tags"`
	Features        []string         `json:"features"`
	IsFeatured      bool             `json:"isFeatured"`
	IsNewArrival    bool             `json:"isNewArrival"`
	Stock           int              `json:"stock"`
}

type UpdateProductInput struct {
	Name            string           `json:"name"`
	Description     string           `json:"description"`
	ShortDesc       string           `json:"shortDesc"`
	MetalType       MetalType        `json:"metalType"`
	Purity          string           `json:"purity"`
	CategoryID      string           `json:"categoryId"`
	Images          []string         `json:"images"`
	Thumbnail       string           `json:"thumbnail"`
	BasePrice       float64          `json:"basePrice"`
	DiscountPercent float64          `json:"discountPercent"`
	Variants        []ProductVariant `json:"variants"`
	Tags            []string         `json:"tags"`
	Features        []string         `json:"features"`
	IsFeatured      bool             `json:"isFeatured"`
	IsNewArrival    bool             `json:"isNewArrival"`
	IsBestSeller    bool             `json:"isBestSeller"`
	IsActive        bool             `json:"isActive"`
	Stock           int              `json:"stock"`
}

type ProductFilter struct {
	MetalType  string   `form:"metalType"`
	CategoryID string   `form:"categoryId"`
	MinPrice   float64  `form:"minPrice"`
	MaxPrice   float64  `form:"maxPrice"`
	Purity     string   `form:"purity"`
	Tags       []string `form:"tags"`
	Search     string   `form:"search"`
	IsFeatured string   `form:"isFeatured"`
	SortBy     string   `form:"sortBy"`
	SortOrder  string   `form:"sortOrder"`
	Page       int      `form:"page"`
	Limit      int      `form:"limit"`
}

