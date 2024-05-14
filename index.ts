import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import pg, { Pool } from 'pg';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const dbConfig: pg.PoolConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'GroceryDB',
    password: 'postgres',
    port: 5432,
};

const pool = new Pool(dbConfig);

app.get('/products', async (req: Request, res: Response) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Products');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/products/:id', async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    try {
        const { rows } = await pool.query('SELECT * FROM Products WHERE ProductID = $1', [productId]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/products', async (req: Request, res: Response) => {
    const newProduct = req.body;
    try {
        const { rows } = await pool.query('INSERT INTO Products (ProductName, CategoryID, Price, Quantity, Description, SupplierID) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [newProduct.ProductName, newProduct.CategoryID, newProduct.Price, newProduct.Quantity, newProduct.Description, newProduct.SupplierID]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/products/:id', async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    try {
        const { rows } = await pool.query('UPDATE Products SET ProductName = $1, CategoryID = $2, Price = $3, Quantity = $4, Description = $5, SupplierID = $6 WHERE ProductID = $7 RETURNING *', [updatedProduct.ProductName, updatedProduct.CategoryID, updatedProduct.Price, updatedProduct.Quantity, updatedProduct.Description, updatedProduct.SupplierID, productId]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/products/:id', async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    try {
        await pool.query('DELETE FROM Products WHERE ProductID = $1', [productId]);
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/user/book', (req: Request, res: Response) => {
    const bookedProducts = req.body.productIds;
    console.log('Booked products:', bookedProducts);
    res.json({ message: 'Products booked successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port:${PORT}`);
});
