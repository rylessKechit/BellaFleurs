// src/app/admin/produits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Image as ImageIcon,
  Upload,
  X,
  Save,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

// Types
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'bouquets' | 'compositions' | 'plantes' | 'evenements';
  subcategory: string;
  images: string[];
  isActive: boolean;
  tags: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  category: Product['category'];
  subcategory: string;
  tags: string[];
  isActive: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

const categories = {
  bouquets: ['romantique', 'anniversaire', 'deuil', 'naissance', 'félicitations'],
  compositions: ['moderne', 'classique', 'zen', 'colorée', 'exotique'],
  plantes: ['intérieur', 'extérieur', 'dépolluante', 'grasse', 'fleurie'],
  evenements: ['mariage', 'baptême', 'communion', 'anniversaire', 'entreprise']
};

const initialForm: ProductForm = {
  name: '',
  description: '',
  price: 0,
  category: 'bouquets',
  subcategory: '',
  tags: [],
  isActive: true,
  seo: {
    title: '',
    description: '',
    keywords: []
  }
};

// Composant d'upload d'images
function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5 
}: { 
  images: string[], 
  onImagesChange: (images: string[]) => void,
  maxImages?: number 
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const newImages = [...images, ...data.data.urls].slice(0, maxImages);
        onImagesChange(newImages);
        toast.success('Images uploadées avec succès');
      } else {
        throw new Error('Erreur lors de l\'upload');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload des images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
              <Button
                size="sm"
                variant="destructive"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {index === 0 && (
              <Badge className="absolute bottom-2 left-2 bg-green-600">
                Principale
              </Badge>
            )}
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Ajouter</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      
      {uploading && (
        <div className="text-center text-sm text-gray-600">
          Upload en cours...
        </div>
      )}
    </div>
  );
}

// Composant de formulaire produit
function ProductForm({ 
  product, 
  isEdit = false, 
  onSave, 
  onCancel 
}: { 
  product?: Product | null,
  isEdit?: boolean,
  onSave: (data: ProductForm, images: string[]) => void,
  onCancel: () => void 
}) {
  const [form, setForm] = useState<ProductForm>(
    product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      tags: product.tags,
      isActive: product.isActive,
      seo: product.seo
    } : initialForm
  );
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.description || form.price <= 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (images.length === 0) {
      toast.error('Veuillez ajouter au moins une image');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(form, images);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom du produit *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="Ex: Bouquet Romantique Rose"
          />
        </div>
        <div>
          <Label htmlFor="price">Prix (€) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
            placeholder="45.90"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e: any) => setForm({...form, description: e.target.value})}
          placeholder="Décrivez votre création florale..."
          rows={4}
        />
      </div>

      {/* Catégorie et sous-catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Catégorie *</Label>
          <Select 
            value={form.category} 
            onValueChange={(value: Product['category']) => setForm({
              ...form, 
              category: value,
              subcategory: '' // Reset subcategory
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bouquets">Bouquets</SelectItem>
              <SelectItem value="compositions">Compositions</SelectItem>
              <SelectItem value="plantes">Plantes</SelectItem>
              <SelectItem value="evenements">Événements</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sous-catégorie</Label>
          <Select 
            value={form.subcategory} 
            onValueChange={(value: any) => setForm({...form, subcategory: value})}
            disabled={!form.category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une sous-catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories[form.category]?.map(sub => (
                <SelectItem key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
        <Input
          id="tags"
          value={form.tags.join(', ')}
          onChange={(e) => setForm({
            ...form, 
            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
          })}
          placeholder="rose, romantique, rouge"
        />
      </div>

      {/* Images */}
      <div>
        <Label>Images *</Label>
        <ImageUpload images={images} onImagesChange={setImages} />
        <p className="text-sm text-gray-500 mt-1">
          La première image sera utilisée comme image principale
        </p>
      </div>

      {/* SEO */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-medium text-gray-900">Référencement (SEO)</h3>
        <div>
          <Label htmlFor="seoTitle">Titre SEO</Label>
          <Input
            id="seoTitle"
            value={form.seo.title}
            onChange={(e) => setForm({
              ...form, 
              seo: {...form.seo, title: e.target.value}
            })}
            placeholder="Titre optimisé pour les moteurs de recherche"
          />
        </div>
        <div>
          <Label htmlFor="seoDescription">Description SEO</Label>
          <Textarea
            id="seoDescription"
            value={form.seo.description}
            onChange={(e: any) => setForm({
              ...form, 
              seo: {...form.seo, description: e.target.value}
            })}
            placeholder="Description pour les moteurs de recherche"
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="seoKeywords">Mots-clés SEO</Label>
          <Input
            id="seoKeywords"
            value={form.seo.keywords.join(', ')}
            onChange={(e) => setForm({
              ...form, 
              seo: {
                ...form.seo, 
                keywords: e.target.value.split(',').map(kw => kw.trim()).filter(Boolean)
              }
            })}
            placeholder="bouquet, fleurs, livraison"
          />
        </div>
      </div>

      {/* Actions */}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Sauvegarde...' : (isEdit ? 'Modifier' : 'Créer')}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products || []);
      } else {
        throw new Error('Erreur lors du chargement des produits');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les produits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async (formData: ProductForm, images: string[]) => {
    try {
      const productData = {
        ...formData,
        images
      };

      const url = editingProduct 
        ? `/api/admin/products/${editingProduct._id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Produit modifié avec succès' : 'Produit créé avec succès');
        setIsDialogOpen(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Produit supprimé avec succès');
        fetchProducts();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        toast.success(isActive ? 'Produit désactivé' : 'Produit activé');
        fetchProducts();
      } else {
        throw new Error('Erreur lors de la modification');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const openCreateDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
            <p className="text-gray-600 mt-2">
              Créez et gérez vos créations florales
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Produit
          </Button>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="bouquets">Bouquets</SelectItem>
                    <SelectItem value="compositions">Compositions</SelectItem>
                    <SelectItem value="plantes">Plantes</SelectItem>
                    <SelectItem value="evenements">Événements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des produits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={product.images[0] || '/api/placeholder/300/200'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge 
                  className={`absolute top-2 right-2 ${
                    product.isActive ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  {product.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(product)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleActive(product._id, product.isActive)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {product.isActive ? 'Désactiver' : 'Activer'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-green-600">
                    {product.price.toFixed(2)}€
                  </span>
                  <Badge variant="outline">
                    {product.category}
                  </Badge>
                </div>
                
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {product.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{product.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Aucun produit ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre premier produit.'
                }
              </p>
              {(!searchTerm && filterCategory === 'all') && (
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un produit
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialog de création/modification */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              isEdit={!!editingProduct}
              onSave={handleSaveProduct}
              onCancel={closeDialog}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}