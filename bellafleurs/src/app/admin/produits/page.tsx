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
  MoreHorizontal,
  Move,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

// Catégories fixes
const CATEGORIES = [
  'Bouquets',
  'Fleurs de saisons',
  'Compositions piquées', 
  'Roses',
  'Orchidées',
  'Deuil',
  'Incontournable',
];

// Types
interface ProductVariant {
  name: string;
  price: number;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price?: number;
  hasVariants: boolean;
  variants: ProductVariant[];
  pricingType?: 'fixed' | 'variants' | 'custom_range';
  customPricing?: {
    minPrice: number;
    maxPrice: number;
  };
  displayPrice?: number;
  displayPriceFormatted?: string;
  priceRangeFormatted?: string;
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
  price?: number;
  hasVariants: boolean;
  variants: ProductVariant[];
  pricingType: 'fixed' | 'variants' | 'custom_range';
  customPricing?: {
    minPrice: number;
    maxPrice: number;
  };
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
  hasVariants: false,
  variants: [],
  pricingType: 'fixed',
  category: 'Bouquets',
  tags: [],
  isActive: true,
  entretien: '',
  motsClesSEO: []
};

const initialVariant: ProductVariant = {
  name: '',
  price: 0,
  description: '',
  image: '',
  isActive: true,
  order: 0
};

// Composant pour gérer les variantes
function VariantManager({ 
  variants, 
  onChange 
}: { 
  variants: ProductVariant[], 
  onChange: (variants: ProductVariant[]) => void 
}) {
  const addVariant = () => {
    const newVariant = {
      ...initialVariant,
      order: variants.length,
      name: `Taille ${variants.length + 1}`
    };
    onChange([...variants, newVariant]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    onChange(updatedVariants);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    // Réajuster les ordres
    const reorderedVariants = updatedVariants.map((variant, i) => ({
      ...variant,
      order: i
    }));
    onChange(reorderedVariants);
  };

  const moveVariant = (fromIndex: number, toIndex: number) => {
    const updatedVariants = [...variants];
    const [moved] = updatedVariants.splice(fromIndex, 1);
    updatedVariants.splice(toIndex, 0, moved);
    
    // Réajuster les ordres
    const reorderedVariants = updatedVariants.map((variant, i) => ({
      ...variant,
      order: i
    }));
    onChange(reorderedVariants);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Variantes de tailles</Label>
        <Button type="button" onClick={addVariant} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une taille
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm">Aucune variante définie</p>
          <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter une taille" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start space-x-4">
                {/* Contrôles de position */}
                <div className="flex flex-col space-y-1">
                  <Button 
                    type="button"
                    size="sm" 
                    variant="ghost"
                    onClick={() => moveVariant(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="ghost"
                    onClick={() => moveVariant(index, Math.min(variants.length - 1, index + 1))}
                    disabled={index === variants.length - 1}
                  >
                    ↓
                  </Button>
                </div>

                {/* Champs de la variante */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`variant-name-${index}`} className="text-xs">Nom de la taille *</Label>
                    <Input
                      id={`variant-name-${index}`}
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder="ex: Petit, Moyen, Grand"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`variant-price-${index}`} className="text-xs">Prix (€) *</Label>
                    <Input
                      id={`variant-price-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.price || ''}
                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="25.00"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-end space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={variant.isActive}
                        onCheckedChange={(checked) => updateVariant(index, 'isActive', checked)}
                      />
                      <Label className="text-xs">Disponible</Label>
                    </div>
                    <Button 
                      type="button"
                      onClick={() => removeVariant(index)} 
                      size="sm" 
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Description de la variante */}
              <div className="mt-3 pl-12">
                <Label htmlFor={`variant-description-${index}`} className="text-xs">Description (optionnelle)</Label>
                <Textarea
                  id={`variant-description-${index}`}
                  value={variant.description || ''}
                  onChange={(e) => updateVariant(index, 'description', e.target.value)}
                  placeholder="ex: Idéal pour une table de 4 personnes"
                  rows={2}
                  className="mt-1"
                />
              </div>

              {/* Image spécifique à la variante (optionnelle) */}
              <div className="mt-3 pl-12">
                <Label htmlFor={`variant-image-${index}`} className="text-xs">Image spécifique (optionnelle)</Label>
                <Input
                  id={`variant-image-${index}`}
                  value={variant.image || ''}
                  onChange={(e) => updateVariant(index, 'image', e.target.value)}
                  placeholder="URL de l'image pour cette variante"
                  className="mt-1"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {variants.length > 0 && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium">💡 Conseils :</p>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• La première variante sera affichée par défaut</li>
            <li>• Utilisez les flèches pour réorganiser l'ordre d'affichage</li>
            <li>• Les images spécifiques sont optionnelles (sinon, l'image principale sera utilisée)</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// Composant d'upload d'images (simplifié)
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
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        // TON FORMAT : { success: true, data: { urls: ["https://..."] } }
        let newImages: string[] = [];
        
        if (result.data.urls && Array.isArray(result.data.urls)) {
          newImages = result.data.urls.filter((url: string) => 
            typeof url === 'string' && url.trim().length > 0
          );
        }
        
        if (newImages.length > 0) {
          onImagesChange([...images, ...newImages].slice(0, maxImages));
          toast.success(`${newImages.length} image(s) uploadée(s) avec succès`);
        } else {
          console.error('Aucune URL trouvée dans:', result.data);
          toast.error('Aucune URL d\'image trouvée dans la réponse');
        }
      } else {
        console.error('Upload failed:', result);
        toast.error(result?.error?.message || result?.message || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
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
      <Label className="text-sm font-medium">Images du produit *</Label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                Principale
              </div>
            )}
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-xs text-gray-600 text-center px-1">Ajouter</span>
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

// Composant de formulaire produit avec support des variants et prix personnalisé
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
      hasVariants: product.hasVariants || false,
      variants: product.variants || [],
      pricingType: product.pricingType || 'fixed',
      customPricing: product.customPricing,
      category: product.category,
      tags: product.tags || [],
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
    
    // Validations côté client
    if (!form.name.trim()) {
      toast.error('Le nom du produit est requis');
      return;
    }

    if (!form.description.trim()) {
      toast.error('La description est requise');
      return;
    }

    if (form.pricingType === 'fixed' && (!form.price || form.price <= 0)) {
      toast.error('Le prix est requis pour les produits à prix fixe');
      return;
    }

    if (form.pricingType === 'variants' && (!form.variants || form.variants.length === 0)) {
      toast.error('Au moins une variante est requise pour les produits avec variants');
      return;
    }

    if (form.pricingType === 'custom_range') {
      if (!form.customPricing || !form.customPricing.minPrice || !form.customPricing.maxPrice) {
        toast.error('Prix minimum et maximum requis pour un prix personnalisable');
        return;
      }
      if (form.customPricing.maxPrice <= form.customPricing.minPrice) {
        toast.error('Le prix maximum doit être supérieur au prix minimum');
        return;
      }
    }

    if (form.pricingType === 'variants') {
      // Valider chaque variante
      for (let i = 0; i < form.variants.length; i++) {
        const variant = form.variants[i];
        if (!variant.name.trim()) {
          toast.error(`Le nom de la variante ${i + 1} est requis`);
          return;
        }
        if (!variant.price || variant.price <= 0) {
          toast.error(`Le prix de la variante "${variant.name}" est requis`);
          return;
        }
      }
    }

    if (images.length === 0) {
      toast.error('Au moins une image est requise');
      return;
    }

    // Validation des images comme strings
    const validImages = images.filter(img => typeof img === 'string' && img.trim().length > 0);
    if (validImages.length === 0) {
      toast.error('Les images ne sont pas valides. Veuillez les re-uploader.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(form, validImages);
    } finally {
      setIsSaving(false);
    }
  };

  // Gestion du toggle variants et pricing type
  const handlePricingTypeChange = (pricingType: 'fixed' | 'variants' | 'custom_range') => {
    setForm(prev => ({
      ...prev,
      pricingType,
      hasVariants: pricingType === 'variants',
      // Initialiser les variants si on passe en mode variants
      variants: pricingType === 'variants' && prev.variants.length === 0 
        ? [{ ...initialVariant, name: 'Taille unique', price: prev.price || 0 }]
        : prev.variants,
      // Initialiser customPricing si on passe en mode custom_range
      customPricing: pricingType === 'custom_range' && !prev.customPricing
        ? { minPrice: 0, maxPrice: 0 }
        : prev.customPricing
    }));
  };

  // Gestion des tags
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
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
      const newTags = tagInput.split(/[,;]/)
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag && !form.tags.includes(tag));
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, ...newTags]
      }));
      setTagInput('');
    }
  };

  // Gestion des mots-clés SEO
  const addMotCle = () => {
    const motCle = motsClesInput.trim();
    if (motCle && !form.motsClesSEO.includes(motCle)) {
      setForm(prev => ({
        ...prev,
        motsClesSEO: [...prev.motsClesSEO, motCle]
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ex: Bouquet de roses rouges"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez votre création florale..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Type de prix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Type de prix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="fixed"
                name="pricingType"
                value="fixed"
                checked={form.pricingType === 'fixed'}
                onChange={(e) => handlePricingTypeChange(e.target.value as any)}
                className="w-4 h-4 text-green-600"
              />
              <Label htmlFor="fixed">Prix fixe</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="variants"
                name="pricingType"
                value="variants"
                checked={form.pricingType === 'variants'}
                onChange={(e) => handlePricingTypeChange(e.target.value as any)}
                className="w-4 h-4 text-green-600"
              />
              <Label htmlFor="variants">Prix par taille (variants)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="custom_range"
                name="pricingType"
                value="custom_range"
                checked={form.pricingType === 'custom_range'}
                onChange={(e) => handlePricingTypeChange(e.target.value as any)}
                className="w-4 h-4 text-green-600"
              />
              <Label htmlFor="custom_range">Prix personnalisable</Label>
            </div>
          </div>

          {form.pricingType === 'custom_range' && (
            <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="minPrice">Prix minimum (€) *</Label>
                <Input
                  id="minPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.customPricing?.minPrice || ''}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    customPricing: {
                      ...prev.customPricing,
                      minPrice: parseFloat(e.target.value) || 0,
                      maxPrice: prev.customPricing?.maxPrice || 0
                    }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Prix maximum (€) *</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.customPricing?.maxPrice || ''}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    customPricing: {
                      minPrice: prev.customPricing?.minPrice || 0,
                      maxPrice: parseFloat(e.target.value) || 0
                    }
                  }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prix fixe */}
      {form.pricingType === 'fixed' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prix</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="price">Prix (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price || ''}
                onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="25.00"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variants */}
      {form.pricingType === 'variants' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Variants (tailles)</CardTitle>
          </CardHeader>
          <CardContent>
            <VariantManager
              variants={form.variants}
              onChange={(variants) => setForm(prev => ({ ...prev, variants }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={5}
          />
        </CardContent>
      </Card>

      {/* Tags et référencement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tags et référencement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="mt-1">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Tapez un tag et appuyez sur Entrée (ou séparez par des virgules)"
              />
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mots-clés SEO */}
          <div>
            <Label htmlFor="motsClesSEO">Mots-clés SEO</Label>
            <div className="mt-1">
              <Input
                id="motsClesSEO"
                value={motsClesInput}
                onChange={(e) => setMotsClesInput(e.target.value)}
                onKeyDown={handleMotCleKeyDown}
                placeholder="Mot-clé pour le référencement"
              />
              {form.motsClesSEO.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.motsClesSEO.map((motCle, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {motCle}
                      <button
                        type="button"
                        onClick={() => removeMotCle(motCle)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions d'entretien */}
          <div>
            <Label htmlFor="entretien">Instructions d'entretien</Label>
            <Textarea
              id="entretien"
              value={form.entretien}
              onChange={(e) => setForm(prev => ({ ...prev, entretien: e.target.value }))}
              placeholder="Comment bien entretenir cette création..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Sauvegarde...' : (isEdit ? 'Mettre à jour' : 'Créer le produit')}
        </Button>
      </div>
    </form>
  );
}

// Composant principal de la page admin produits
export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { incrementCartCount } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        activeOnly: 'false',
        search: searchTerm,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        limit: '100'
      });

      const response = await fetch(`/api/products?${params}`);
      const result = await response.json();

      if (result.success) {
        setProducts(result.data.products || []);
      } else {
        toast.error(result.error?.message || 'Erreur lors du chargement des produits');
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Erreur lors du chargement des produits');
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
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingProduct ? 'Produit mis à jour avec succès' : 'Produit créé avec succès');
        setShowForm(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        toast.error(result.error?.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Save product error:', error);
      toast.error('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Produit supprimé avec succès');
        fetchProducts();
      } else {
        toast.error(result.error?.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  // Fonction pour afficher le prix d'un produit
  const displayProductPrice = (product: Product) => {
    if (product.pricingType === 'custom_range' && product.customPricing) {
      return `${product.customPricing.minPrice}€ - ${product.customPricing.maxPrice}€`;
    } else if (product.hasVariants) {
      return product.priceRangeFormatted || 'Prix non défini';
    } else {
      return product.displayPriceFormatted || `${product.price}€`;
    }
  };

  if (showForm) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {editingProduct ? 'Modifier le produit' : 'Créer un nouveau produit'}
            </h1>
          </div>

          <ProductForm
            product={editingProduct}
            isEdit={!!editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestion des produits</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher des produits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={fetchProducts} variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des produits */}
        {isLoading ? (
          <div className="text-center py-12">
            <p>Chargement des produits...</p>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Aucun produit trouvé</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer votre premier produit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={product.images[0] || '/api/placeholder/300/200'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="bg-white/80">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteProduct(product)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Badge pour le type de produit */}
                  <div className="absolute top-2 left-2">
                    {product.pricingType === 'custom_range' && (
                      <Badge variant="default" className="text-xs">
                        Prix personnalisable
                      </Badge>
                    )}
                    {product.hasVariants && (
                      <Badge variant="secondary" className="text-xs">
                        Multi-tailles
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg truncate flex-1">{product.name}</h3>
                    <Badge variant={product.isActive ? "default" : "secondary"} className="ml-2">
                      {product.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-green-600">
                      {displayProductPrice(product)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Affichage des variants pour les produits multi-tailles */}
                  {product.hasVariants && product.variants && product.variants.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-2">
                        {product.variants.length} taille{product.variants.length > 1 ? 's' : ''} :
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.variants.map((variant, index) => (
                          <Badge 
                            key={index} 
                            variant={variant.isActive ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {variant.name} - {variant.price}€
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Affichage pour prix personnalisable */}
                  {product.pricingType === 'custom_range' && product.customPricing && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-1">Fourchette de prix :</p>
                      <p className="text-sm font-medium">
                        {product.customPricing.minPrice}€ - {product.customPricing.maxPrice}€
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}