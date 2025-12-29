package middleware

import (
	"strings"

	"ejewel/internal/models"
	"ejewel/internal/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.UnauthorizedError(c, "Authorization header required")
			c.Abort()
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			utils.UnauthorizedError(c, "Invalid authorization header format")
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(tokenParts[1])
		if err != nil {
			utils.UnauthorizedError(c, "Invalid or expired token")
			c.Abort()
			return
		}

		c.Set("userId", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)
		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists {
			utils.UnauthorizedError(c, "User role not found")
			c.Abort()
			return
		}

		if role != models.RoleAdmin {
			utils.ForbiddenError(c, "Admin access required")
			c.Abort()
			return
		}

		c.Next()
	}
}

func SellerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists {
			utils.UnauthorizedError(c, "User role not found")
			c.Abort()
			return
		}

		if role != models.RoleAdmin && role != models.RoleSeller {
			utils.ForbiddenError(c, "Seller access required")
			c.Abort()
			return
		}

		c.Next()
	}
}

func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.Next()
			return
		}

		claims, err := utils.ValidateToken(tokenParts[1])
		if err != nil {
			c.Next()
			return
		}

		c.Set("userId", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)
		c.Next()
	}
}

