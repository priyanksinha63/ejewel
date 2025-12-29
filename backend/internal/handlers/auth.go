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
)

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input models.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if user exists
	var existingUser models.User
	err := database.Users().FindOne(ctx, bson.M{"email": input.Email}).Decode(&existingUser)
	if err == nil {
		utils.ErrorResponse(c, http.StatusConflict, "User with this email already exists")
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		utils.InternalError(c, "Failed to hash password")
		return
	}

	// Create user
	user := models.User{
		ID:        primitive.NewObjectID(),
		Email:     input.Email,
		Password:  hashedPassword,
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Phone:     input.Phone,
		Role:      models.RoleCustomer,
		IsActive:  true,
		Addresses: []models.Address{},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = database.Users().InsertOne(ctx, user)
	if err != nil {
		utils.InternalError(c, "Failed to create user")
		return
	}

	// Generate tokens
	accessToken, err := utils.GenerateToken(&user)
	if err != nil {
		utils.InternalError(c, "Failed to generate access token")
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(&user)
	if err != nil {
		utils.InternalError(c, "Failed to generate refresh token")
		return
	}

	// Update refresh token in database
	database.Users().UpdateOne(ctx, bson.M{"_id": user.ID}, bson.M{"$set": bson.M{"refresh_token": refreshToken}})

	utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", models.AuthResponse{
		User:         &user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := database.Users().FindOne(ctx, bson.M{"email": input.Email}).Decode(&user)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	if !user.IsActive {
		utils.ErrorResponse(c, http.StatusForbidden, "Account is deactivated")
		return
	}

	if !utils.CheckPassword(input.Password, user.Password) {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	accessToken, err := utils.GenerateToken(&user)
	if err != nil {
		utils.InternalError(c, "Failed to generate access token")
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(&user)
	if err != nil {
		utils.InternalError(c, "Failed to generate refresh token")
		return
	}

	database.Users().UpdateOne(ctx, bson.M{"_id": user.ID}, bson.M{"$set": bson.M{"refresh_token": refreshToken}})

	utils.SuccessResponse(c, http.StatusOK, "Login successful", models.AuthResponse{
		User:         &user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	claims, err := utils.ValidateToken(input.RefreshToken)
	if err != nil {
		utils.UnauthorizedError(c, "Invalid refresh token")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userID, _ := primitive.ObjectIDFromHex(claims.UserID)
	var user models.User
	err = database.Users().FindOne(ctx, bson.M{"_id": userID, "refresh_token": input.RefreshToken}).Decode(&user)
	if err != nil {
		utils.UnauthorizedError(c, "Invalid refresh token")
		return
	}

	accessToken, err := utils.GenerateToken(&user)
	if err != nil {
		utils.InternalError(c, "Failed to generate access token")
		return
	}

	newRefreshToken, err := utils.GenerateRefreshToken(&user)
	if err != nil {
		utils.InternalError(c, "Failed to generate refresh token")
		return
	}

	database.Users().UpdateOne(ctx, bson.M{"_id": user.ID}, bson.M{"$set": bson.M{"refresh_token": newRefreshToken}})

	utils.SuccessResponse(c, http.StatusOK, "Token refreshed successfully", gin.H{
		"accessToken":  accessToken,
		"refreshToken": newRefreshToken,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	userID, _ := c.Get("userId")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))
	database.Users().UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": bson.M{"refresh_token": ""}})

	utils.SuccessResponse(c, http.StatusOK, "Logged out successfully", nil)
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("userId")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))
	var user models.User
	err := database.Users().FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		utils.NotFoundError(c, "User not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", user)
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("userId")

	var input models.UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))

	update := bson.M{
		"updated_at": time.Now(),
	}

	if input.FirstName != "" {
		update["first_name"] = input.FirstName
	}
	if input.LastName != "" {
		update["last_name"] = input.LastName
	}
	if input.Phone != "" {
		update["phone"] = input.Phone
	}
	if input.Avatar != "" {
		update["avatar"] = input.Avatar
	}
	if input.Addresses != nil {
		for i := range input.Addresses {
			if input.Addresses[i].ID.IsZero() {
				input.Addresses[i].ID = primitive.NewObjectID()
			}
		}
		update["addresses"] = input.Addresses
	}

	_, err := database.Users().UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": update})
	if err != nil {
		utils.InternalError(c, "Failed to update profile")
		return
	}

	var user models.User
	database.Users().FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)

	utils.SuccessResponse(c, http.StatusOK, "Profile updated successfully", user)
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, _ := c.Get("userId")

	var input struct {
		CurrentPassword string `json:"currentPassword" binding:"required"`
		NewPassword     string `json:"newPassword" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objectID, _ := primitive.ObjectIDFromHex(userID.(string))
	var user models.User
	err := database.Users().FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		utils.NotFoundError(c, "User not found")
		return
	}

	if !utils.CheckPassword(input.CurrentPassword, user.Password) {
		utils.ErrorResponse(c, http.StatusBadRequest, "Current password is incorrect")
		return
	}

	hashedPassword, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		utils.InternalError(c, "Failed to hash password")
		return
	}

	_, err = database.Users().UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": bson.M{"password": hashedPassword, "updated_at": time.Now()}})
	if err != nil {
		utils.InternalError(c, "Failed to change password")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password changed successfully", nil)
}

