package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
)

type Produto struct {
	ID        int     `json:"id"`
	Nome      string  `json:"nome"`
	Preco     float64 `json:"preco"`
	Categoria string  `json:"categoria"`
}

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("mysql", "root:@tcp(127.0.0.1:3309)/parcasbar")
	if err != nil {
		log.Fatal("Erro na conexão com o banco:", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal("Erro ao pingar banco:", err)
	}

	// Servir arquivos estáticos
	http.Handle("/frontend/", http.StripPrefix("/frontend/", http.FileServer(http.Dir("frontend"))))
	http.Handle("/img/", http.StripPrefix("/img/", http.FileServer(http.Dir("img"))))

	// Rotas
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/produtos", handleProdutos)

	log.Println("🚀 Servidor rodando em http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("frontend/index.html")
	if err != nil {
		http.Error(w, "Erro ao carregar página", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}

func handleProdutos(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, nome, preco, categoria FROM produtos")
	if err != nil {
		http.Error(w, "Erro ao buscar produtos", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var produtos []Produto
	for rows.Next() {
		var p Produto
		if err := rows.Scan(&p.ID, &p.Nome, &p.Preco, &p.Categoria); err != nil {
			log.Println("Erro no scan:", err)
			continue
		}
		produtos = append(produtos, p)
	}

	fmt.Println(produtos) // Log dos produtos para verificação

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(produtos)
}
