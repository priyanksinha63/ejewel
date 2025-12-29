package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderStatus string

const (
	OrderPending    OrderStatus = "pending"
	OrderConfirmed  OrderStatus = "confirmed"
	OrderProcessing OrderStatus = "processing"
	OrderShipped    OrderStatus = "shipped"
	OrderDelivered  OrderStatus = "delivered"
	OrderCancelled  OrderStatus = "cancelled"
	OrderRefunded   OrderStatus = "refunded"
)

type PaymentStatus string

const (
	PaymentPending   PaymentStatus = "pending"
	PaymentCompleted PaymentStatus = "completed"
	PaymentFailed    PaymentStatus = "failed"
	PaymentRefunded  PaymentStatus = "refunded"
)

type PaymentMethod string

const (
	PaymentCOD    PaymentMethod = "cod"
	PaymentCard   PaymentMethod = "card"
	PaymentUPI    PaymentMethod = "upi"
	PaymentWallet PaymentMethod = "wallet"
)

type OrderItem struct {
	ProductID   primitive.ObjectID `bson:"product_id" json:"productId"`
	ProductName string             `bson:"product_name" json:"productName"`
	Thumbnail   string             `bson:"thumbnail" json:"thumbnail"`
	VariantID   primitive.ObjectID `bson:"variant_id,omitempty" json:"variantId,omitempty"`
	Size        string             `bson:"size" json:"size"`
	Quantity    int                `bson:"quantity" json:"quantity"`
	Price       float64            `bson:"price" json:"price"`
	TotalPrice  float64            `bson:"total_price" json:"totalPrice"`
}

type ShippingInfo struct {
	Address       Address   `bson:"address" json:"address"`
	Method        string    `bson:"method" json:"method"`
	Cost          float64   `bson:"cost" json:"cost"`
	TrackingID    string    `bson:"tracking_id" json:"trackingId"`
	Carrier       string    `bson:"carrier" json:"carrier"`
	EstimatedDate time.Time `bson:"estimated_date" json:"estimatedDate"`
}

type PaymentInfo struct {
	Method        PaymentMethod `bson:"method" json:"method"`
	Status        PaymentStatus `bson:"status" json:"status"`
	TransactionID string        `bson:"transaction_id" json:"transactionId"`
	PaidAt        time.Time     `bson:"paid_at" json:"paidAt"`
}

type Order struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderNumber   string             `bson:"order_number" json:"orderNumber"`
	UserID        primitive.ObjectID `bson:"user_id" json:"userId"`
	UserEmail     string             `bson:"user_email" json:"userEmail"`
	UserName      string             `bson:"user_name" json:"userName"`
	Items         []OrderItem        `bson:"items" json:"items"`
	Subtotal      float64            `bson:"subtotal" json:"subtotal"`
	Tax           float64            `bson:"tax" json:"tax"`
	Discount      float64            `bson:"discount" json:"discount"`
	CouponCode    string             `bson:"coupon_code" json:"couponCode"`
	ShippingInfo  ShippingInfo       `bson:"shipping_info" json:"shippingInfo"`
	PaymentInfo   PaymentInfo        `bson:"payment_info" json:"paymentInfo"`
	Total         float64            `bson:"total" json:"total"`
	Status        OrderStatus        `bson:"status" json:"status"`
	Notes         string             `bson:"notes" json:"notes"`
	CancelReason  string             `bson:"cancel_reason" json:"cancelReason"`
	CreatedAt     time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updatedAt"`
}

type CreateOrderInput struct {
	AddressID     string        `json:"addressId" binding:"required"`
	PaymentMethod PaymentMethod `json:"paymentMethod" binding:"required"`
	ShippingMethod string       `json:"shippingMethod"`
	CouponCode    string        `json:"couponCode"`
	Notes         string        `json:"notes"`
}

type UpdateOrderStatusInput struct {
	Status       OrderStatus `json:"status" binding:"required"`
	TrackingID   string      `json:"trackingId"`
	Carrier      string      `json:"carrier"`
	CancelReason string      `json:"cancelReason"`
}

