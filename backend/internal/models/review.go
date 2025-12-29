package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Review struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProductID   primitive.ObjectID `bson:"product_id" json:"productId"`
	UserID      primitive.ObjectID `bson:"user_id" json:"userId"`
	UserName    string             `bson:"user_name" json:"userName"`
	UserAvatar  string             `bson:"user_avatar" json:"userAvatar"`
	Rating      int                `bson:"rating" json:"rating"`
	Title       string             `bson:"title" json:"title"`
	Comment     string             `bson:"comment" json:"comment"`
	Images      []string           `bson:"images" json:"images"`
	IsVerified  bool               `bson:"is_verified" json:"isVerified"`
	HelpfulCount int              `bson:"helpful_count" json:"helpfulCount"`
	CreatedAt   time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updatedAt"`
}

type CreateReviewInput struct {
	ProductID string   `json:"productId" binding:"required"`
	Rating    int      `json:"rating" binding:"required,min=1,max=5"`
	Title     string   `json:"title"`
	Comment   string   `json:"comment" binding:"required"`
	Images    []string `json:"images"`
}

type UpdateReviewInput struct {
	Rating  int      `json:"rating" binding:"min=1,max=5"`
	Title   string   `json:"title"`
	Comment string   `json:"comment"`
	Images  []string `json:"images"`
}

