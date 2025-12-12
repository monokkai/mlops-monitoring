package handler

import (
	cmd "auth-service/internal/config"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// -----
// TODO: Remove all stuff that provides any info about created user:
// 	"message":        "User with this email already exists",
//  "details(email)": existingUser.Email,
//-----

var db *sql.DB

func InitDatabase(dbName string) error {
	var err error
	db, err = sql.Open("mysql", dbName)
	if err != nil {
		return err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db.Ping()
}

func CreateUser(user *cmd.User) error {
	query := `INSERT INTO users (uuid, username, email, password_hash, first_name, last_name, is_active, is_verified, role, created_at, updated_at)`

	result, err := db.Exec(query,
		user.Username,
		user.Email,
		user.PasswordHash,
		sql.NullString{String: user.FirstName.String, Valid: user.FirstName.Valid},
		sql.NullString{String: user.LastName.String, Valid: user.LastName.Valid},
		user.Role,
	)

	if err != nil {
		return err
	}
	user.ID, err = result.LastInsertId()
	return err
}

func FindUserById(id int64) (*cmd.User, error) {
	user := &cmd.User{}

	query := `SELECT id, uuid, username, email, password_hash, first_name, last_name, is_active, is_verified, role, created_at, updated_at FROM users WHERE id = ?`

	err := db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return user, nil
}

func FindUserByEmail(email string) (*cmd.User, error) {
	query := `SELECT id, uuid, username, email, password_hash, first_name, last_name, is_active, is_verified, role, created_at, updated_at FROM users WHERE email = ?`

	user := &cmd.User{}

	err := db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}

func FindUserByUsername(username string) (*cmd.User, error) {
	user := &cmd.User{}

	query := `SELECT id, uuid, username, email, password_hash, first_name, last_name, is_active, is_verified, role, created_at, updated_at FROM users WHERE username = ?`

	err := db.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}

func Register(c *gin.Context) {
	var req cmd.UserCreateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"details": err.Error(),
		})
		return
	}

	existingUser, err := FindUserById(req.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"details": err.Error(),
		})
		return
	}

	if existingUser != nil {
		c.JSON(http.StatusAccepted, gin.H{
			"message":         "User already exists",
			"details(userId)": existingUser,
		})
	}

	existingUser, err = FindUserByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"details": err.Error(),
		})
		return
	}

	if existingUser != nil {
		c.JSON(http.StatusAccepted, gin.H{
			"message":        "User with this email already exists",
			"details(email)": existingUser.Email,
		})
		return
	}

	existingUser, err = FindUserByUsername(req.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"details": err.Error(),
		})
		return
	}
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{
			"message":           "User with this username already exists",
			"details(username)": existingUser.Username,
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to hash password",
			"datails": err.Error(),
		})
		return
	}

	user := &cmd.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FirstName:    sql.NullString{String: req.FirstName, Valid: req.FirstName != ""},
		LastName:     sql.NullString{String: req.LastName, Valid: req.LastName != ""},
		Role:         "user",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create user",
			"details": err.Error(),
		})
		return
	}

	res := cmd.UserResponse{
		ID:        user.ID,
		UUID:      user.UUID,
		Username:  user.Username,
		Email:     user.Email,
		FirstName: user.FirstName.String,
		LastName:  user.LastName.String,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user":    res,
	})
}
