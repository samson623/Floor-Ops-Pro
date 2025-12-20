'use client';

import { useState, useCallback, useRef } from 'react';
import { usePermissions } from '@/components/permission-context';
import { toast } from 'sonner';

// ══════════════════════════════════════════════════════════════════
// ENTERPRISE CAMERA CAPTURE HOOK
// FloorOps Pro - Professional Field Photo Documentation
// ══════════════════════════════════════════════════════════════════

export interface CapturedPhoto {
    id: string;
    url: string;                    // Base64 data URL for immediate display
    timestamp: string;              // ISO timestamp
    takenBy: string;                // User who captured the photo
    location?: {
        latitude: number;
        longitude: number;
        accuracy: number;
    };
    deviceInfo?: string;            // Device/browser info for audit trail
    fileSize?: number;              // Compressed size in bytes
}

export interface UseCameraOptions {
    maxPhotos?: number;             // Maximum photos per session (default: 10)
    maxSizeMB?: number;             // Max file size in MB (default: 2)
    quality?: number;               // JPEG quality 0-1 (default: 0.85)
    captureLocation?: boolean;      // Request GPS location (default: true)
    onPhotoCapture?: (photo: CapturedPhoto) => void;
}

export interface UseCameraReturn {
    // State
    photos: CapturedPhoto[];
    isCapturing: boolean;
    error: string | null;

    // Computed
    isMobile: boolean;
    hasPermission: boolean;
    canCapture: boolean;

    // Actions
    capturePhoto: () => void;
    removePhoto: (id: string) => void;
    clearPhotos: () => void;
    retake: (id: string) => void;
}

/**
 * Enterprise-grade camera capture hook for flooring field operations.
 * 
 * Features:
 * - Native mobile camera access (single tap to camera app)
 * - Desktop fallback to file picker
 * - Automatic image compression
 * - GPS metadata capture (with permission)
 * - Role-based permission enforcement (UPLOAD_PHOTOS)
 * - Audit trail with timestamps and user info
 * 
 * @example
 * ```tsx
 * const { capturePhoto, photos, isCapturing, hasPermission } = useCameraCapture({
 *     maxPhotos: 5,
 *     onPhotoCapture: (photo) => console.log('Captured:', photo.id)
 * });
 * 
 * return hasPermission ? (
 *     <Button onClick={capturePhoto} disabled={isCapturing}>
 *         <Camera /> Take Photo
 *     </Button>
 * ) : null;
 * ```
 */
export function useCameraCapture(options: UseCameraOptions = {}): UseCameraReturn {
    const {
        maxPhotos = 10,
        maxSizeMB = 2,
        quality = 0.85,
        captureLocation = true,
        onPhotoCapture
    } = options;

    const { currentUser, can } = usePermissions();
    const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const retakeId = useRef<string | null>(null);

    // Detect mobile device
    const isMobile = typeof window !== 'undefined' && (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches)
    );

    // Permission check
    const hasPermission = can('UPLOAD_PHOTOS');
    const canCapture = hasPermission && photos.length < maxPhotos;

    /**
     * Get current GPS location (with user permission)
     */
    const getLocation = useCallback((): Promise<CapturedPhoto['location'] | undefined> => {
        if (!captureLocation || typeof navigator === 'undefined' || !navigator.geolocation) {
            return Promise.resolve(undefined);
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                () => resolve(undefined), // Silently fail - location is optional
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
            );
        });
    }, [captureLocation]);

    /**
     * Compress image to target size
     */
    const compressImage = useCallback((
        dataUrl: string,
        targetQuality: number = quality
    ): Promise<{ url: string; size: number }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Scale down if larger than 2000px on any side
                const maxDimension = 2000;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL('image/jpeg', targetQuality);
                    const size = Math.round((compressed.length - 22) * 0.75); // Approximate size

                    // If still too large, compress more
                    if (size > maxSizeMB * 1024 * 1024 && targetQuality > 0.4) {
                        resolve(compressImage(dataUrl, targetQuality - 0.1) as Promise<{ url: string; size: number }>);
                    } else {
                        resolve({ url: compressed, size });
                    }
                } else {
                    resolve({ url: dataUrl, size: dataUrl.length });
                }
            };
            img.src = dataUrl;
        });
    }, [quality, maxSizeMB]);

    /**
     * Process captured file
     */
    const processFile = useCallback(async (file: File) => {
        setIsCapturing(true);
        setError(null);

        try {
            // Read file as data URL
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Compress the image
            const { url, size } = await compressImage(dataUrl);

            // Get location (async, don't block)
            const location = await getLocation();

            // Create photo object
            const photo: CapturedPhoto = {
                id: retakeId.current || `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                url,
                timestamp: new Date().toISOString(),
                takenBy: currentUser?.name || 'Unknown',
                location,
                deviceInfo: navigator.userAgent.slice(0, 100),
                fileSize: size
            };

            // If retaking, replace the old photo
            if (retakeId.current) {
                setPhotos(prev => prev.map(p => p.id === retakeId.current ? photo : p));
                retakeId.current = null;
                toast.success('Photo replaced!');
            } else {
                setPhotos(prev => [...prev, photo]);
                toast.success('Photo captured!');
            }

            // Callback
            onPhotoCapture?.(photo);

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to process photo';
            setError(message);
            toast.error(message);
        } finally {
            setIsCapturing(false);
        }
    }, [compressImage, getLocation, currentUser, onPhotoCapture]);

    /**
     * Handle file input change
     */
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
        // Reset input so same file can be selected again
        event.target.value = '';
    }, [processFile]);

    /**
     * Create hidden file input (once)
     */
    const ensureFileInput = useCallback(() => {
        if (fileInputRef.current) return fileInputRef.current;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        // On mobile, this opens the native camera app
        if (isMobile) {
            input.capture = 'environment'; // Back camera preferred
        }

        input.style.display = 'none';
        input.addEventListener('change', (e) => handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>));
        document.body.appendChild(input);
        fileInputRef.current = input;

        return input;
    }, [isMobile, handleFileChange]);

    /**
     * Trigger camera/file picker
     */
    const capturePhoto = useCallback(() => {
        if (!hasPermission) {
            setError('You do not have permission to upload photos');
            toast.error('Permission denied: Cannot upload photos');
            return;
        }

        if (photos.length >= maxPhotos) {
            setError(`Maximum ${maxPhotos} photos allowed`);
            toast.error(`Maximum ${maxPhotos} photos reached`);
            return;
        }

        retakeId.current = null;
        const input = ensureFileInput();
        input.click();
    }, [hasPermission, photos.length, maxPhotos, ensureFileInput]);

    /**
     * Remove a photo
     */
    const removePhoto = useCallback((id: string) => {
        setPhotos(prev => prev.filter(p => p.id !== id));
        toast.success('Photo removed');
    }, []);

    /**
     * Clear all photos
     */
    const clearPhotos = useCallback(() => {
        setPhotos([]);
    }, []);

    /**
     * Retake a specific photo (opens camera to replace it)
     */
    const retake = useCallback((id: string) => {
        retakeId.current = id;
        const input = ensureFileInput();
        input.click();
    }, [ensureFileInput]);

    return {
        photos,
        isCapturing,
        error,
        isMobile,
        hasPermission,
        canCapture,
        capturePhoto,
        removePhoto,
        clearPhotos,
        retake
    };
}

// ══════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ══════════════════════════════════════════════════════════════════

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get relative time string
 */
export function getRelativeTime(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return then.toLocaleDateString();
}
