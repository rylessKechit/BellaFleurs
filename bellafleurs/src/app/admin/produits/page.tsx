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

// Catégories fixes - bonnes catégories
const CATEGORIES = [
  'Bouquets',
  'Fleurs de saisons',
  'Compositions piquées', 
  'Roses',
  'Orchidées',
  'Deuil',
  'Abonnement'
];

// Types
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isActive: boolean;
  tags: string[];
  entretien?: string;
  motsClesSEO?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  isActive: boolean;
  entretien: string;
  motsClesSEO: string[];
}

const initialForm: ProductForm = {
  name: '',
  description: '',
  price: 0,
  category: 'Bouquets',
  tags: [],
  isActive: true,
  entretien: '',
  motsClesSEO: []
};

// Composant d'upload d'images - RESPONSIVE APPLIQUÉ
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
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-20 sm:h-24 md:h-32 object-cover rounded-lg"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
              <Button
                size="sm"
                variant="destructive"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
            {index === 0 && (
              <Badge className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 bg-green-600 text-xs">
                Principale
              </Badge>
            )}
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="w-full h-20 sm:h-24 md:h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
            <Upload className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm text-gray-600 text-center px-1">Ajouter</span>
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
        <div className="text-center text-xs sm:text-sm text-gray-600">
          Upload en cours...
        </div>
      )}
    </div>
  );
}

// Composant de formulaire produit - RESPONSIVE APPLIQUÉ
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
      tags: product.tags,
      isActive: product.isActive,
      entretien: product.entretien || '',
      motsClesSEO: product.motsClesSEO || []
    } : initialForm
  );
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [isSaving, setIsSaving] = useState(false);

  // États pour les inputs de tags et mots-clés
  const [tagInput, setTagInput] = useState('');
  const [motsClesInput, setMotsClesInput] = useState('');

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

  // Gestion des tags
  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === ',' || e.key === ';') {
      e.preventDefault();
      // Traiter les tags séparés par virgule
      const newTags = tagInput.split(/[,;]/).map(tag => tag.trim()).filter(tag => tag && !form.tags.includes(tag));
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, ...newTags]
      }));
      setTagInput('');
    }
  };

  // Gestion des mots-clés SEO
  const addMotCle = () => {
    if (motsClesInput.trim() && !form.motsClesSEO.includes(motsClesInput.trim())) {
      setForm(prev => ({
        ...prev,
        motsClesSEO: [...prev.motsClesSEO, motsClesInput.trim()]
      }));
      setMotsClesInput('');
    }
  };

  const removeMotCle = (motCleToRemove: string) => {
    setForm(prev => ({
      ...prev,
      motsClesSEO: prev.motsClesSEO.filter(motCle => motCle !== motCleToRemove)
    }));
  };

  const handleMotCleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMotCle();
    } else if (e.key === ',' || e.key === ';') {
      e.preventDefault();
      // Traiter les mots-clés séparés par virgule
      const newMotsCles = motsClesInput.split(/[,;]/).map(motCle => motCle.trim()).filter(motCle => motCle && !form.motsClesSEO.includes(motCle));
      setForm(prev => ({
        ...prev,
        motsClesSEO: [...prev.motsClesSEO, ...newMotsCles]
      }));
      setMotsClesInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Informations de base - RESPONSIVE APPLIQUÉ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Informations de base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="name" className="text-sm sm:text-base">Nom du produit *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="Ex: Bouquet de roses rouges"
                className="text-sm sm:text-base"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-sm sm:text-base">Prix (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
                placeholder="45.90"
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm sm:text-base">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="Décrivez votre création florale..."
              rows={4}
              className="text-sm sm:text-base"
            />
          </div>

          {/* Catégorie uniquement - RESPONSIVE APPLIQUÉ */}
          <div>
            <Label className="text-sm sm:text-base">Catégorie *</Label>
            <Select 
              value={form.category} 
              onValueChange={(value) => setForm({...form, category: value})}
            >
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tags et SEO - RESPONSIVE APPLIQUÉ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Tags et SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          
          {/* Tags */}
          <div>
            <Label htmlFor="tags" className="text-sm sm:text-base">Tags</Label>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Tapez un tag et appuyez sur Entrée ou virgule"
                  className="text-sm sm:text-base flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm" className="w-full sm:w-auto">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="sm:inline">Ajouter</span>
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Séparez les tags par une virgule (,) ou appuyez sur Entrée
              </p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {form.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Mots-clés SEO - RESPONSIVE APPLIQUÉ */}
          <div>
            <Label htmlFor="motsClesSEO" className="text-sm sm:text-base">Mots-clés SEO</Label>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <Input
                  id="motsClesSEO"
                  value={motsClesInput}
                  onChange={(e) => setMotsClesInput(e.target.value)}
                  onKeyDown={handleMotCleKeyDown}
                  placeholder="Tapez un mot-clé et appuyez sur Entrée ou virgule"
                  className="text-sm sm:text-base flex-1"
                />
                <Button type="button" onClick={addMotCle} variant="outline" size="sm" className="w-full sm:w-auto">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="sm:inline">Ajouter</span>
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Séparez les mots-clés par une virgule (,) ou appuyez sur Entrée
              </p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {form.motsClesSEO.map((motCle, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1 text-xs">
                    {motCle}
                    <button
                      type="button"
                      onClick={() => removeMotCle(motCle)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images - RESPONSIVE APPLIQUÉ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Images *</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload images={images} onImagesChange={setImages} />
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            La première image sera utilisée comme image principale
          </p>
        </CardContent>
      </Card>

      {/* Détails optionnels - RESPONSIVE APPLIQUÉ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Détails optionnels</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="entretien" className="text-sm sm:text-base">Instructions d'entretien</Label>
            <Textarea
              id="entretien"
              value={form.entretien}
              onChange={(e) => setForm({...form, entretien: e.target.value})}
              placeholder="Comment entretenir ce produit..."
              rows={3}
              className="text-sm sm:text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions - RESPONSIVE APPLIQUÉ */}
      <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Annuler
        </Button>
        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
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
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        
        {/* Header - RESPONSIVE APPLIQUÉ */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Produits</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Créez et gérez vos créations florales
            </p>
          </div>
          <Button onClick={openCreateDialog} className="self-start sm:self-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Produit
          </Button>
        </div>

        {/* Filtres et recherche - RESPONSIVE APPLIQUÉ */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des produits - RESPONSIVE APPLIQUÉ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={product.images[0] || '/api/placeholder/300/200'}
                  alt={product.name}
                  className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-t-lg"
                />
                <Badge 
                  className={`absolute top-2 right-2 text-xs ${
                    product.isActive ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  {product.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate flex-1 mr-2">
                    {product.name}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1 sm:p-2">
                        <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
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
                
                <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-base sm:text-lg font-bold text-green-600">
                    {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}€
                  </span>
                  <Badge variant="outline" className="text-xs">
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
            <CardContent className="text-center py-8 sm:py-12">
              <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
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

        {/* Dialog de création/modification - RESPONSIVE APPLIQUÉ */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
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