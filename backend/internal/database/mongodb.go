package database

import (
	"context"
	"log"
	"time"

	"ejewel/internal/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database
var Client *mongo.Client

func Connect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(config.AppConfig.MongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return err
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		return err
	}

	Client = client
	DB = client.Database(config.AppConfig.MongoDB)
	log.Println("Connected to MongoDB!")

	return nil
}

func Disconnect() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if Client != nil {
		Client.Disconnect(ctx)
	}
}

// Collections
func Users() *mongo.Collection {
	return DB.Collection("users")
}

func Products() *mongo.Collection {
	return DB.Collection("products")
}

func Categories() *mongo.Collection {
	return DB.Collection("categories")
}

func Orders() *mongo.Collection {
	return DB.Collection("orders")
}

func Carts() *mongo.Collection {
	return DB.Collection("carts")
}

func Wishlists() *mongo.Collection {
	return DB.Collection("wishlists")
}

func Reviews() *mongo.Collection {
	return DB.Collection("reviews")
}

