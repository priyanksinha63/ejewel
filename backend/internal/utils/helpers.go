package utils

import (
	"crypto/rand"
	"fmt"
	"regexp"
	"strings"
	"time"
)

func GenerateSlug(name string) string {
	slug := strings.ToLower(name)
	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove special characters
	reg := regexp.MustCompile("[^a-z0-9-]+")
	slug = reg.ReplaceAllString(slug, "")
	// Remove multiple consecutive hyphens
	reg = regexp.MustCompile("-+")
	slug = reg.ReplaceAllString(slug, "-")
	// Trim hyphens from ends
	slug = strings.Trim(slug, "-")
	return slug
}

func GenerateOrderNumber() string {
	timestamp := time.Now().Format("20060102")
	randomBytes := make([]byte, 4)
	rand.Read(randomBytes)
	randomPart := fmt.Sprintf("%X", randomBytes)
	return fmt.Sprintf("EJ-%s-%s", timestamp, randomPart)
}

func GenerateSKU(metalType, category string, id int) string {
	metal := strings.ToUpper(string(metalType[0]))
	cat := strings.ToUpper(string(category[0]))
	return fmt.Sprintf("%s%s-%06d", metal, cat, id)
}

func CalculateDiscountPrice(basePrice float64, discountPercent float64) float64 {
	if discountPercent <= 0 {
		return basePrice
	}
	return basePrice - (basePrice * discountPercent / 100)
}

