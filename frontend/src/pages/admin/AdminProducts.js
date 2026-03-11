import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import AdminNav from "@/components/AdminNav";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = [
  "perfumes",
  "auriculares",
  "zapatillas",
  "mochilas",
  "altavoces",
  "relojes",
  "ropa",
  "gorras"
];

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "zapatillas",
    brand: "",
    image_url: "",
    stock: "100"
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "zapatillas",
      brand: "",
      image_url: "",
      stock: "100"
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/admin/products`,
        {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        },
        { withCredentials: true }
      );
      toast.success("Product added successfully");
      setShowAddDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Failed to add product", error);
      toast.error("Failed to add product");
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API}/admin/products/${editingProduct.product_id}`,
        {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        },
        { withCredentials: true }
      );
      toast.success("Product updated successfully");
      setShowEditDialog(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await axios.delete(`${API}/admin/products/${productId}`, { withCredentials: true });
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error("Failed to delete product");
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      brand: product.brand || "",
      image_url: product.image_url,
      stock: product.stock.toString()
    });
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const ProductForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-zinc-400">Product Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="bg-zinc-900 border-zinc-800 text-white"
          data-testid="product-name-input"
        />
      </div>
      <div>
        <Label htmlFor="description" className="text-zinc-400">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          className="bg-zinc-900 border-zinc-800 text-white"
          data-testid="product-description-input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="text-zinc-400">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            required
            className="bg-zinc-900 border-zinc-800 text-white"
            data-testid="product-price-input"
          />
        </div>
        <div>
          <Label htmlFor="stock" className="text-zinc-400">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleInputChange}
            required
            className="bg-zinc-900 border-zinc-800 text-white"
            data-testid="product-stock-input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category" className="text-zinc-400">Category</Label>
          <Select value={formData.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white" data-testid="product-category-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat} className="hover:bg-zinc-800">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="brand" className="text-zinc-400">Brand (Optional)</Label>
          <Input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            className="bg-zinc-900 border-zinc-800 text-white"
            data-testid="product-brand-input"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="image_url" className="text-zinc-400">Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleInputChange}
          required
          className="bg-zinc-900 border-zinc-800 text-white"
          data-testid="product-image-input"
        />
      </div>
      <Button type="submit" className="w-full btn-primary" data-testid="product-submit-btn">
        {submitLabel}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="admin-products-page">
      <AdminNav />
      
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="admin-products-title">
            Manage Products
          </h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <button className="btn-primary flex items-center gap-2" data-testid="add-product-btn">
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm onSubmit={handleAddProduct} submitLabel="Add Product" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <div className="glass-panel rounded-2xl p-8" data-testid="products-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4 text-zinc-400 font-medium">Product</th>
                  <th className="text-left py-4 px-4 text-zinc-400 font-medium">Category</th>
                  <th className="text-left py-4 px-4 text-zinc-400 font-medium">Price</th>
                  <th className="text-left py-4 px-4 text-zinc-400 font-medium">Stock</th>
                  <th className="text-right py-4 px-4 text-zinc-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id} className="border-b border-zinc-800/50" data-testid={`product-row-${product.product_id}`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.brand && <div className="text-sm text-zinc-500">{product.brand}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">{product.category}</td>
                    <td className="py-4 px-4 font-semibold">${product.price}</td>
                    <td className="py-4 px-4">
                      <span className={product.stock > 10 ? 'text-green-500' : 'text-yellow-500'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDialog(product)}
                          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          data-testid={`edit-product-${product.product_id}`}
                        >
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.product_id)}
                          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          data-testid={`delete-product-${product.product_id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">Edit Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSubmit={handleEditProduct} submitLabel="Save Changes" />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
