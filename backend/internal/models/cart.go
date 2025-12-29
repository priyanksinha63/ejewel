package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CartItem struct {
	ProductID   primitive.ObjectID `bson:"product_id" json:"productId"`
	ProductName string             `bson:"product_name" json:"productName"`
	Thumbnail   string             `bson:"thumbnail" json:"thumbnail"`
	VariantID   primitive.ObjectID `bson:"variant_id,omitempty" json:"variantId,omitempty"`
	Size        string             `bson:"size" json:"size"`
	Price       float64            `bson:"price" json:"price"`
	Quantity    int                `bson:"quantity" json:"quantity"`
	AddedAt     time.Time          `bson:"added_at" json:"addedAt"`
}

type Cart struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"userId"`
	Items     []CartItem         `bson:"items" json:"items"`
	Total     float64            `bson:"total" json:"total"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updatedAt"`
}

type AddToCartInput struct {
	ProductID string `json:"productId" binding:"required"`
	VariantID string `json:"variantId"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

type UpdateCartItemInput struct {
	Quantity int `json:"quantity" binding:"required,min=0"`
}

type Wishlist struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID   `bson:"user_id" json:"userId"`
	Products  []primitive.ObjectID `bson:"products" json:"products"`
	UpdatedAt time.Time            `bson:"updated_at" json:"updatedAt"`
}

type WishlistProduct struct {
	ID            primitive.ObjectID `json:"id"`
	Name          string             `json:"name"`
	Thumbnail     string             `json:"thumbnail"`
	BasePrice     float64            `json:"basePrice"`
	DiscountPrice float64            `json:"discountPrice"`
	MetalType     MetalType          `json:"metalType"`
	IsActive      bool               `json:"isActive"`
	Stock         int                `json:"stock"`
}

