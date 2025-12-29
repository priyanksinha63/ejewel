package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Category struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Slug        string             `bson:"slug" json:"slug"`
	Description string             `bson:"description" json:"description"`
	Image       string             `bson:"image" json:"image"`
	Icon        string             `bson:"icon" json:"icon"`
	ParentID    primitive.ObjectID `bson:"parent_id,omitempty" json:"parentId,omitempty"`
	IsActive    bool               `bson:"is_active" json:"isActive"`
	SortOrder   int                `bson:"sort_order" json:"sortOrder"`
	CreatedAt   time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updatedAt"`
}

type CreateCategoryInput struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Image       string `json:"image"`
	Icon        string `json:"icon"`
	ParentID    string `json:"parentId"`
	SortOrder   int    `json:"sortOrder"`
}

type UpdateCategoryInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Image       string `json:"image"`
	Icon        string `json:"icon"`
	ParentID    string `json:"parentId"`
	IsActive    bool   `json:"isActive"`
	SortOrder   int    `json:"sortOrder"`
}

