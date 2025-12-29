package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Role string

const (
	RoleCustomer Role = "customer"
	RoleAdmin    Role = "admin"
	RoleSeller   Role = "seller"
)

type Address struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type      string             `bson:"type" json:"type"` // home, work, other
	Street    string             `bson:"street" json:"street"`
	City      string             `bson:"city" json:"city"`
	State     string             `bson:"state" json:"state"`
	Country   string             `bson:"country" json:"country"`
	ZipCode   string             `bson:"zip_code" json:"zipCode"`
	Phone     string             `bson:"phone" json:"phone"`
	IsDefault bool               `bson:"is_default" json:"isDefault"`
}

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email        string             `bson:"email" json:"email"`
	Password     string             `bson:"password" json:"-"`
	FirstName    string             `bson:"first_name" json:"firstName"`
	LastName     string             `bson:"last_name" json:"lastName"`
	Phone        string             `bson:"phone" json:"phone"`
	Avatar       string             `bson:"avatar" json:"avatar"`
	Role         Role               `bson:"role" json:"role"`
	Addresses    []Address          `bson:"addresses" json:"addresses"`
	IsActive     bool               `bson:"is_active" json:"isActive"`
	IsVerified   bool               `bson:"is_verified" json:"isVerified"`
	RefreshToken string             `bson:"refresh_token" json:"-"`
	CreatedAt    time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updatedAt"`
}

type RegisterInput struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
	Phone     string `json:"phone"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UpdateUserInput struct {
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Phone     string    `json:"phone"`
	Avatar    string    `json:"avatar"`
	Addresses []Address `json:"addresses"`
}

type AuthResponse struct {
	User         *User  `json:"user"`
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

