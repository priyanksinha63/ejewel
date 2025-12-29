package main

import (
	"context"
	"log"
	"time"

	"ejewel/internal/config"
	"ejewel/internal/database"
	"ejewel/internal/handlers"
	"ejewel/internal/middleware"
	"ejewel/internal/models"
	"ejewel/internal/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	// Load config
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Connect to MongoDB
	err = database.Connect()
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer database.Disconnect()

	// Seed initial data
	seedData()

	// Initialize Gin
	router := gin.Default()
	router.Use(middleware.CORSMiddleware())

	// Initialize handlers
	authHandler := handlers.NewAuthHandler()
	productHandler := handlers.NewProductHandler()
	categoryHandler := handlers.NewCategoryHandler()
	cartHandler := handlers.NewCartHandler()
	wishlistHandler := handlers.NewWishlistHandler()
	orderHandler := handlers.NewOrderHandler()
	reviewHandler := handlers.NewReviewHandler()
	adminHandler := handlers.NewAdminHandler()

	// API routes
	api := router.Group("/api")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "message": "eJewel API is running"})
		})

		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/logout", middleware.AuthMiddleware(), authHandler.Logout)
			auth.GET("/profile", middleware.AuthMiddleware(), authHandler.GetProfile)
			auth.PUT("/profile", middleware.AuthMiddleware(), authHandler.UpdateProfile)
			auth.PUT("/change-password", middleware.AuthMiddleware(), authHandler.ChangePassword)
		}

		// Product routes (public)
		products := api.Group("/products")
		{
			products.GET("", productHandler.GetProducts)
			products.GET("/featured", productHandler.GetFeaturedProducts)
			products.GET("/new-arrivals", productHandler.GetNewArrivals)
			products.GET("/best-sellers", productHandler.GetBestSellers)
			products.GET("/search", productHandler.SearchProducts)
			products.GET("/:id", productHandler.GetProduct)
			products.GET("/:productId/reviews", reviewHandler.GetProductReviews)
		}

		// Category routes (public)
		categories := api.Group("/categories")
		{
			categories.GET("", categoryHandler.GetCategories)
			categories.GET("/:id", categoryHandler.GetCategory)
		}

		// Cart routes (authenticated)
		cart := api.Group("/cart")
		cart.Use(middleware.AuthMiddleware())
		{
			cart.GET("", cartHandler.GetCart)
			cart.POST("", cartHandler.AddToCart)
			cart.PUT("/:productId", cartHandler.UpdateCartItem)
			cart.DELETE("/:productId", cartHandler.RemoveFromCart)
			cart.DELETE("", cartHandler.ClearCart)
		}

		// Wishlist routes (authenticated)
		wishlist := api.Group("/wishlist")
		wishlist.Use(middleware.AuthMiddleware())
		{
			wishlist.GET("", wishlistHandler.GetWishlist)
			wishlist.POST("", wishlistHandler.AddToWishlist)
			wishlist.DELETE("/:productId", wishlistHandler.RemoveFromWishlist)
			wishlist.DELETE("", wishlistHandler.ClearWishlist)
		}

		// Order routes (authenticated)
		orders := api.Group("/orders")
		orders.Use(middleware.AuthMiddleware())
		{
			orders.GET("", orderHandler.GetOrders)
			orders.POST("", orderHandler.CreateOrder)
			orders.GET("/:id", orderHandler.GetOrder)
			orders.POST("/:id/cancel", orderHandler.CancelOrder)
		}

		// Review routes (authenticated)
		reviews := api.Group("/reviews")
		reviews.Use(middleware.AuthMiddleware())
		{
			reviews.POST("", reviewHandler.CreateReview)
			reviews.PUT("/:id", reviewHandler.UpdateReview)
			reviews.DELETE("/:id", reviewHandler.DeleteReview)
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			admin.GET("/dashboard", adminHandler.GetDashboardStats)
			admin.GET("/users", adminHandler.GetUsers)
			admin.GET("/users/:id", adminHandler.GetUser)
			admin.PUT("/users/:id", adminHandler.UpdateUser)
			admin.GET("/products", adminHandler.GetAllProducts)
			admin.POST("/products", productHandler.CreateProduct)
			admin.PUT("/products/:id", productHandler.UpdateProduct)
			admin.DELETE("/products/:id", productHandler.DeleteProduct)
			admin.GET("/orders", orderHandler.GetAllOrders)
			admin.PUT("/orders/:id/status", orderHandler.UpdateOrderStatus)
			admin.POST("/categories", categoryHandler.CreateCategory)
			admin.PUT("/categories/:id", categoryHandler.UpdateCategory)
			admin.DELETE("/categories/:id", categoryHandler.DeleteCategory)
		}
	}

	log.Printf("Server starting on port %s", cfg.Port)
	router.Run(":" + cfg.Port)
}

func seedData() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Check if admin exists
	var existingAdmin models.User
	err := database.Users().FindOne(ctx, bson.M{"role": models.RoleAdmin}).Decode(&existingAdmin)
	if err == nil {
		log.Println("Admin user already exists, skipping seed")
		return
	}

	log.Println("Seeding initial data...")

	// Create admin user
	hashedPassword, _ := utils.HashPassword(config.AppConfig.AdminPassword)
	admin := models.User{
		ID:        primitive.NewObjectID(),
		Email:     config.AppConfig.AdminEmail,
		Password:  hashedPassword,
		FirstName: "Admin",
		LastName:  "User",
		Role:      models.RoleAdmin,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	database.Users().InsertOne(ctx, admin)
	log.Println("Admin user created:", admin.Email)

	// Create categories
	categories := []models.Category{
		{ID: primitive.NewObjectID(), Name: "Rings", Slug: "rings", Description: "Elegant gold and silver rings for every occasion", Icon: "💍", IsActive: true, SortOrder: 1, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Necklaces", Slug: "necklaces", Description: "Beautiful necklaces and chains", Icon: "📿", IsActive: true, SortOrder: 2, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Earrings", Slug: "earrings", Description: "Stunning earrings collection", Icon: "✨", IsActive: true, SortOrder: 3, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Bracelets", Slug: "bracelets", Description: "Exquisite bracelets and bangles", Icon: "⭕", IsActive: true, SortOrder: 4, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Pendants", Slug: "pendants", Description: "Charming pendants and lockets", Icon: "💎", IsActive: true, SortOrder: 5, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{ID: primitive.NewObjectID(), Name: "Anklets", Slug: "anklets", Description: "Traditional and modern anklets", Icon: "🦶", IsActive: true, SortOrder: 6, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	for _, cat := range categories {
		database.Categories().InsertOne(ctx, cat)
	}
	log.Println("Categories created")

	// Create sample products
	products := []models.Product{
		{
			ID:              primitive.NewObjectID(),
			Name:            "22K Gold Diamond Engagement Ring",
			Slug:            "22k-gold-diamond-engagement-ring",
			Description:     "A stunning 22K gold engagement ring featuring a brilliant-cut diamond center stone surrounded by smaller accent diamonds. Perfect for your special moment.",
			ShortDesc:       "Elegant 22K gold diamond ring for engagements",
			MetalType:       models.MetalGold,
			Purity:          "22K",
			CategoryID:      categories[0].ID,
			CategoryName:    "Rings",
			Images:          []string{"https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800"},
			Thumbnail:       "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
			BasePrice:       125000,
			DiscountPrice:   112500,
			DiscountPercent: 10,
			Tags:            []string{"engagement", "diamond", "gold", "wedding"},
			Features:        []string{"BIS Hallmarked", "IGI Certified Diamond", "Lifetime Exchange"},
			IsFeatured:      true,
			IsNewArrival:    true,
			IsActive:        true,
			Stock:           15,
			Rating:          4.8,
			ReviewCount:     24,
			SellerID:        admin.ID,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Sterling Silver Pearl Necklace",
			Slug:            "sterling-silver-pearl-necklace",
			Description:     "A timeless 925 sterling silver necklace adorned with freshwater pearls. This elegant piece adds sophistication to any outfit.",
			ShortDesc:       "Classic sterling silver pearl necklace",
			MetalType:       models.MetalSilver,
			Purity:          "925 Sterling",
			CategoryID:      categories[1].ID,
			CategoryName:    "Necklaces",
			Images:          []string{"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800"},
			Thumbnail:       "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
			BasePrice:       8500,
			DiscountPrice:   7225,
			DiscountPercent: 15,
			Tags:            []string{"pearl", "silver", "elegant", "classic"},
			Features:        []string{"925 Sterling Silver", "Freshwater Pearls", "Rhodium Plated"},
			IsFeatured:      true,
			IsBestSeller:    true,
			IsActive:        true,
			Stock:           30,
			Rating:          4.6,
			ReviewCount:     42,
			SellerID:        admin.ID,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "18K Rose Gold Drop Earrings",
			Slug:            "18k-rose-gold-drop-earrings",
			Description:     "Elegant 18K rose gold drop earrings with delicate filigree work. These lightweight earrings are perfect for both everyday wear and special occasions.",
			ShortDesc:       "Delicate rose gold drop earrings",
			MetalType:       models.MetalRoseGold,
			Purity:          "18K",
			CategoryID:      categories[2].ID,
			CategoryName:    "Earrings",
			Images:          []string{"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800", "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800"},
			Thumbnail:       "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400",
			BasePrice:       45000,
			DiscountPrice:   45000,
			DiscountPercent: 0,
			Tags:            []string{"rose gold", "earrings", "elegant", "filigree"},
			Features:        []string{"18K Rose Gold", "Lightweight Design", "Secure Backing"},
			IsFeatured:      true,
			IsNewArrival:    true,
			IsActive:        true,
			Stock:           20,
			Rating:          4.9,
			ReviewCount:     18,
			SellerID:        admin.ID,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "24K Gold Traditional Bangle Set",
			Slug:            "24k-gold-traditional-bangle-set",
			Description:     "A set of 4 exquisite 24K gold bangles with intricate traditional design. These bangles showcase masterful craftsmanship and timeless beauty.",
			ShortDesc:       "Set of 4 traditional gold bangles",
			MetalType:       models.MetalGold,
			Purity:          "24K",
			CategoryID:      categories[3].ID,
			CategoryName:    "Bracelets",
			Images:          []string{"https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800"},
			Thumbnail:       "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
			BasePrice:       285000,
			DiscountPrice:   256500,
			DiscountPercent: 10,
			Tags:            []string{"bangle", "gold", "traditional", "wedding"},
			Features:        []string{"24K Pure Gold", "BIS Hallmarked", "Traditional Design", "Set of 4"},
			IsFeatured:      true,
			IsBestSeller:    true,
			IsActive:        true,
			Stock:           8,
			Rating:          4.7,
			ReviewCount:     31,
			SellerID:        admin.ID,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Silver Peacock Pendant",
			Slug:            "silver-peacock-pendant",
			Description:     "A beautifully crafted silver pendant featuring an ornate peacock design with enamel detailing. This pendant comes with an 18-inch silver chain.",
			ShortDesc:       "Ornate silver peacock pendant with chain",
			MetalType:       models.MetalSilver,
			Purity:          "925 Sterling",
			CategoryID:      categories[4].ID,
			CategoryName:    "Pendants",
			Images:          []string{"https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800", "https://images.unsplash.com/photo-1602752250015-52934bc45613?w=800"},
			Thumbnail:       "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400",
			BasePrice:       4500,
			DiscountPrice:   3825,
			DiscountPercent: 15,
			Tags:            []string{"pendant", "silver", "peacock", "enamel"},
			Features:        []string{"925 Sterling Silver", "Enamel Work", "18-inch Chain Included"},
			IsFeatured:      false,
			IsNewArrival:    true,
			IsActive:        true,
			Stock:           45,
			Rating:          4.5,
			ReviewCount:     56,
			SellerID:        admin.ID,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "22K Gold Traditional Anklet Pair",
			Slug:            "22k-gold-traditional-anklet-pair",
			Description:     "A pair of traditional 22K gold anklets with ghungroo (bells) that create a melodious sound. Perfect for festivals and celebrations.",
			ShortDesc:       "Traditional gold anklets with bells",
			MetalType:       models.MetalGold,
			Purity:          "22K",
			CategoryID:      categories[5].ID,
			CategoryName:    "Anklets",
			Images:          []string{"https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800", "https://images.unsplash.com/photo-1602752250015-52934bc45613?w=800"},
			Thumbnail:       "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400",
			BasePrice:       78000,
			DiscountPrice:   70200,
			DiscountPercent: 10,
			Tags:            []string{"anklet", "gold", "traditional", "ghungroo"},
			Features:        []string{"22K Gold", "BIS Hallmarked", "Melodious Bells", "Pair of 2"},
			IsFeatured:      true,
			IsBestSeller:    false,
			IsActive:        true,
			Stock:           12,
			Rating:          4.6,
			ReviewCount:     19,
			SellerID:        admin.ID,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Platinum Diamond Solitaire Ring",
			Slug:            "platinum-diamond-solitaire-ring",
			Description:     "A luxurious platinum ring featuring a 1-carat VVS clarity diamond solitaire. The epitome of elegance for the most special occasions.",
			ShortDesc:       "Luxury platinum diamond solitaire",
			MetalType:       models.MetalPlatinum,
			Purity:          "950 Platinum",
			CategoryID:      categories[0].ID,
			CategoryName:    "Rings",
			Images:          []string{"https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800"},
			Thumbnail:       "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400",
			BasePrice:       450000,
			DiscountPrice:   427500,
			DiscountPercent: 5,
			Tags:            []string{"platinum", "diamond", "solitaire", "luxury"},
			Features:        []string{"950 Platinum", "1ct VVS Diamond", "GIA Certified", "Lifetime Warranty"},
			IsFeatured:      true,
			IsNewArrival:    false,
			IsBestSeller:    true,
			IsActive:        true,
			Stock:           5,
			Rating:          5.0,
			ReviewCount:     8,
			SellerID:        admin.ID,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              primitive.NewObjectID(),
			Name:            "Silver Charm Bracelet",
			Slug:            "silver-charm-bracelet",
			Description:     "A beautiful 925 sterling silver charm bracelet with 5 interchangeable charms. Add your own charms to personalize your style.",
			ShortDesc:       "Customizable silver charm bracelet",
			MetalType:       models.MetalSilver,
			Purity:          "925 Sterling",
			CategoryID:      categories[3].ID,
			CategoryName:    "Bracelets",
			Images:          []string{"https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800", "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800"},
			Thumbnail:       "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400",
			BasePrice:       6500,
			DiscountPrice:   5525,
			DiscountPercent: 15,
			Tags:            []string{"bracelet", "silver", "charm", "customizable"},
			Features:        []string{"925 Sterling Silver", "5 Charms Included", "Adjustable Size"},
			IsFeatured:      false,
			IsNewArrival:    true,
			IsActive:        true,
			Stock:           35,
			Rating:          4.4,
			ReviewCount:     67,
			SellerID:        admin.ID,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
	}

	for _, prod := range products {
		database.Products().InsertOne(ctx, prod)
	}
	log.Println("Sample products created")

	log.Println("Seed data complete!")
}

