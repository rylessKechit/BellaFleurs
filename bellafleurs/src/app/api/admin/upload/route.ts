// src/app/api/admin/upload/route.ts - Version corrigée
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fonction pour uploader une image vers Cloudinary
async function uploadToCloudinary(file: File, folder: string = 'bella-fleurs/products'): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString('base64');
  const dataUri = `data:${file.type};base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto:good' }
    ]
  });

  return result.secure_url;
}

export async function POST(req: NextRequest) {
  try {
    // Vérifier les droits admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    // Récupérer les fichiers du FormData
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Aucun fichier fourni',
          code: 'NO_FILES'
        }
      }, { status: 400 });
    }

    // Vérifier le nombre de fichiers (max 5)
    if (files.length > 5) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Maximum 5 images autorisées',
          code: 'TOO_MANY_FILES'
        }
      }, { status: 400 });
    }

    // Vérifier le type et la taille des fichiers
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({
          success: false,
          error: {
            message: `Type de fichier non autorisé: ${file.type}. Types autorisés: JPEG, PNG, WebP`,
            code: 'INVALID_FILE_TYPE'
          }
        }, { status: 400 });
      }

      if (file.size > maxSize) {
        return NextResponse.json({
          success: false,
          error: {
            message: `Fichier trop volumineux: ${file.name}. Taille maximum: 5MB`,
            code: 'FILE_TOO_LARGE'
          }
        }, { status: 400 });
      }
    }

    // Uploader les images vers Cloudinary
    const uploadPromises = files.map(file => uploadToCloudinary(file));
    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      message: `${urls.length} image(s) uploadée(s) avec succès`,
      data: {
        urls,
        count: urls.length
      }
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    
    // Erreurs Cloudinary spécifiques
    if (error.http_code) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Erreur lors de l\'upload vers le service de stockage',
          code: 'CLOUDINARY_ERROR',
          details: error.message
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de l\'upload des images',
        code: 'UPLOAD_ERROR'
      }
    }, { status: 500 });
  }
}

// GET - Récupérer les images d'un dossier (optionnel) - Version corrigée
export async function GET(req: NextRequest) {
  try {
    // Vérifier les droits admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    const url = new URL(req.url);
    const folder = url.searchParams.get('folder') || 'bella-fleurs/products';
    const maxResults = parseInt(url.searchParams.get('max_results') || '50');

    // Récupérer les images du dossier Cloudinary - Syntaxe corrigée
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .execute();

    const images = result.resources.map((resource: any) => ({
      url: resource.secure_url,
      publicId: resource.public_id,
      createdAt: resource.created_at,
      width: resource.width,
      height: resource.height,
      size: resource.bytes
    }));

    return NextResponse.json({
      success: true,
      data: {
        images,
        total: result.total_count
      }
    });

  } catch (error: any) {
    console.error('❌ Images GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des images',
        code: 'IMAGES_FETCH_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE - Supprimer une image (optionnel)
export async function DELETE(req: NextRequest) {
  try {
    // Vérifier les droits admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Accès refusé. Droits administrateur requis.',
          code: 'ACCESS_DENIED'
        }
      }, { status: 403 });
    }

    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'ID public de l\'image requis',
          code: 'MISSING_PUBLIC_ID'
        }
      }, { status: 400 });
    }

    // Supprimer l'image de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Image supprimée avec succès'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Erreur lors de la suppression de l\'image',
          code: 'DELETE_FAILED'
        }
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Image DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression de l\'image',
        code: 'IMAGE_DELETE_ERROR'
      }
    }, { status: 500 });
  }
}