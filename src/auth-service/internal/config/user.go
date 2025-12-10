package cmd

import (
	"database/sql"
	"time"
)

type User struct {
	ID           int64          `json:"id"`
	UUID         string         `json:"uuid"`
	Username     string         `json:"username"`
	Email        string         `json:"email"`
	PasswordHash string         `json:"-"`
	FirstName    sql.NullString `json:"first_name,omitempty"`
	LastName     sql.NullString `json:"last_name,omitempty"`
	IsActive     bool           `json:"is_active"`
	IsVerified   bool           `json:"is_verified"`
	Role         string         `json:"role"`

	EmailVerificationToken sql.NullString `json:"-"`
	PasswordResetToken     sql.NullString `json:"-"`
	PasswordResetExpiresAt sql.NullTime   `json:"-"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserCreateRequest struct {
	Username  string `json:"username" binding:"required,min=3,max=50"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
}

type UserLoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// For API (without of strict data required).
type UserResponse struct {
	ID         int64     `json:"id"`
	UUID       string    `json:"uuid"`
	Username   string    `json:"username"`
	Email      string    `json:"email"`
	FirstName  string    `json:"first_name,omitempty"`
	LastName   string    `json:"last_name,omitempty"`
	IsActive   bool      `json:"is_active"`
	IsVerified bool      `json:"is_verified"`
	Role       string    `json:"role"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
