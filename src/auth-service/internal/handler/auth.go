package handler

import (
	cmd "auth-service/internal/config"
	"database/sql"
	"time"
)

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
