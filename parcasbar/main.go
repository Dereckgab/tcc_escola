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

type ItemPedido struct {
	Produto    string `json:"produto"`
	Quantidade int    `json:"quantidade"`
}

type PedidoPayload struct {
	Itens []ItemPedido `json:"itens"`
}

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("mysql", "root:@tcp(127.0.0.1:3306)/parcasbar")
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
	http.HandleFunc("/pedido", handlePedido)

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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(produtos)
}

func handlePedido(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var pedido PedidoPayload
	if err := json.NewDecoder(r.Body).Decode(&pedido); err != nil {
		http.Error(w, "Erro ao decodificar JSON", http.StatusBadRequest)
		return
	}

	// Inserir pedido na tabela 'pedidos'
	res, err := db.Exec("INSERT INTO pedidos () VALUES ()")
	if err != nil {
		http.Error(w, "Erro ao inserir pedido", http.StatusInternalServerError)
		return
	}
	pedidoID, _ := res.LastInsertId()

	// Inserir itens na tabela 'itens_pedido'
	for _, item := range pedido.Itens {
		var produtoID int
		err := db.QueryRow("SELECT id FROM produtos WHERE nome = ?", item.Produto).Scan(&produtoID)
		if err != nil {
			log.Println("Produto não encontrado:", item.Produto)
			continue
		}

		_, err = db.Exec("INSERT INTO itens_pedido (pedido_id, produto_id, quantidade) VALUES (?, ?, ?)",
			pedidoID, produtoID, item.Quantidade)
		if err != nil {
			log.Println("Erro ao inserir item:", err)
		}
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "Pedido recebido com sucesso")
}
