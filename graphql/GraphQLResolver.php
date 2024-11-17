<?php

require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Cart.php';


class GraphQLResolver {
    private $pdo;

    public function __construct() {
        // Initialize the PDO connection
        $database = new Database();
        $this->pdo = $database->getConnection();
    }
    // Method to retrieve a single product by ID
    public function getProduct($variables) {
        $product = new Product($this->pdo);
        return $product->getProductById($variables['id']);
    }

    // Method to retrieve all products
    public function getProducts() {
        $product = new Product($this->pdo);
        return $product->getAllProducts();
    }

    // Method to create a new product
    public function createProduct($variables) {
        $product = new Product($this->pdo);
        $product->create($variables['name'], $variables['price'], $variables['category_id']);
    }

    // Method to update an existing product
    public function updateProduct($variables) {
        $product = new Product($this->pdo);
        $product->update($variables['id'], $variables['name'], $variables['price'], $variables['category_id']);
    }

    // Method to delete a product by ID
    public function deleteProduct($variables) {
        $product = new Product($this->pdo);
        return $product->delete($variables['id']);
    }

    public function getAttributes() : mixed{
        $product = new Product($this->pdo);
        return $product->getAttributes();
    }

    public function signup($variables) {
        $username = $variables['username'];
        $email = $variables['email'];
        $password = $variables['password'];

        if (empty($username) || empty($email) || empty($password)) {
            return ['message' => 'All fields are required.'];
        }

        // Check if the user already exists
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE name = :username OR email = :email");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existingUser) {
            return ['message' => 'Username or email already exists.'];
        }

        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Insert the new user
        $stmt = $this->pdo->prepare("INSERT INTO users (name, email, password) VALUES (:username, :email, :password)");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->execute();

        return [
            'message' => 'User registered successfully.',
            'user' => [
                'id' => $this->pdo->lastInsertId(),
                'username' => $username,
                'email' => $email,
                'token' => null // You can implement JWT or token generation here
            ]
        ];
    }

    // Login Resolver
    public function login($variables) {
        $username = $variables['username'];
        $password = $variables['password'];

        if (empty($username) || empty($password)) {
            return ['message' => 'Username and password are required.'];
        }

        // Check if the user exists
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE name = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password'])) {
            return ['message' => 'Invalid username or password.'];
        }

        // Generate a token (optional: implement JWT)
        $token = base64_encode(random_bytes(32));

        return [
            'message' => 'Login successful.',
            'user' => [
                'id' => $user['id'],
                'username' => $user['name'],
                'email' => $user['email'],
                'token' => $token
            ]
        ];
    }

    // Add to Cart Resolver
    public function addToCart($variables) {
        $productId = $variables['productId'];
        $quantity = $variables['quantity'];

        // Check if product exists
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->bindParam(':id', $productId);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            throw new Exception("Product not found");
        }

        // Add product to cart (or update quantity if already in cart)
        $stmt = $this->pdo->prepare("
            INSERT INTO cart (product_id, quantity) 
            VALUES (:productId, :quantity)
            ON DUPLICATE KEY UPDATE quantity = quantity + :quantity
        ");
        $stmt->bindParam(':productId', $productId);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->execute();

        // Return cart item
        return [
            'id' => $this->pdo->lastInsertId(),
            'product' => $product,
            'quantity' => $quantity
        ];
    }

    // Get Cart Resolver
    public function getCart() {
        $stmt = $this->pdo->query("
            SELECT cart.id as cart_id, products.*, cart.quantity, image_url, amount
            FROM cart 
            JOIN products ON cart.product_id = products.id
            JOIN product_gallery ON product_gallery.product_id = products.id
            JOIN prices ON prices.product_id = products.id
        ");
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($item) {
            return [
                'id' => $item['cart_id'],
                'product' => [
                    'id' => $item['id'],
                    'name' => $item['name'],
                    'price' => $item['amount'],
                    'image_url' => $item['image_url']
                ],
                'quantity' => $item['quantity']
            ];
        }, $cartItems);
    }

    public function updateCart($variables) {
        $itemId = $variables['itemId'];
        $quantityChange = $variables['quantityChange'];
        // Update quantity in the cart
        $stmt = $this->pdo->prepare("
            UPDATE cart 
            SET quantity = quantity + :quantityChange
            WHERE cart.product_id = :id
        ");
        $stmt->bindParam(':quantityChange', $quantityChange);
        $stmt->bindParam(':id', $itemId);
        $stmt->execute();

        // Fetch updated cart item
        $stmt = $this->pdo->prepare("
            SELECT cart.id AS cart_id, products.*, cart.quantity 
            FROM cart 
            JOIN products ON cart.product_id = products.id
        ");
        $stmt->execute();
        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$item) {
            throw new Exception("Cart item not found");
        }

        return [
            'id' => $item['cart_id'],
            'product' => [
                'id' => $item['id'],
                'name' => $item['name'],
            ],
            'quantity' => $item['quantity']
        ];
    }

    // Mutation: Remove Item from Cart
    public function removeFromCart($variables) {
        $itemId = $variables['itemId'];

        // Delete item from the cart
        $stmt = $this->pdo->prepare("DELETE FROM cart WHERE cart.product_id = :id");
        $stmt->bindParam(':id', $itemId);
        $stmt->execute();

        return ['id' => $itemId];
    }

    // Mutation: Place Order
    public function placeOrder() {
        // Simulate order placement (this can be extended)
        $stmt = $this->pdo->query("DELETE FROM cart");
        $stmt->execute();

        return [
            'success' => true,
            'message' => "Order placed successfully!",
        ];
    }
}
