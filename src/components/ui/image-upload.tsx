'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Loader2, ImagePlus, Check, X, Upload, ImageIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    value?: string | null
    onChange: (url: string | null) => void
    disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload')
    const [isUploading, setIsUploading] = useState(false)
    const [galleryImages, setGalleryImages] = useState<{ name: string; url: string }[]>([])
    const [isLoadingGallery, setIsLoadingGallery] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (isOpen && activeTab === 'gallery') {
            fetchGallery()
        }
    }, [isOpen, activeTab])

    const fetchGallery = async () => {
        setIsLoadingGallery(true)
        try {
            const { data, error } = await supabase.storage.from('employees').list('', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            })

            if (error) {
                console.error('Error fetching gallery:', error)
                return
            }

            if (data) {
                const images = data.map((file) => {
                    const { data: { publicUrl } } = supabase.storage
                        .from('employees')
                        .getPublicUrl(file.name)
                    return { name: file.name, url: publicUrl }
                })
                setGalleryImages(images)
            }
        } catch (error) {
            console.error('Error fetching gallery:', error)
        } finally {
            setIsLoadingGallery(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('employees')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('employees')
                .getPublicUrl(filePath)

            onChange(publicUrl)
            setIsOpen(false)
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image')
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(null)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "relative h-24 w-24 rounded-full overflow-hidden border-2 border-muted flex items-center justify-center bg-muted",
                    value ? "border-primary" : "border-dashed"
                )}>
                    {value ? (
                        <>
                            <img
                                src={value}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                            {!disabled && (
                                <button
                                    onClick={handleRemove}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white"
                                    type="button"
                                >
                                    <Trash2 className="h-6 w-6" />
                                </button>
                            )}
                        </>
                    ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                </div>

                {!disabled && (
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" type="button">
                                {value ? 'Change Image' : 'Upload Image'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                            <div className="flex border-b">
                                <button
                                    className={cn(
                                        "flex-1 p-3 text-sm font-medium transition-colors",
                                        activeTab === 'upload' ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => setActiveTab('upload')}
                                    type="button"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Upload
                                    </div>
                                </button>
                                <button
                                    className={cn(
                                        "flex-1 p-3 text-sm font-medium transition-colors",
                                        activeTab === 'gallery' ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => setActiveTab('gallery')}
                                    type="button"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Gallery
                                    </div>
                                </button>
                            </div>

                            <div className="p-4">
                                {activeTab === 'upload' ? (
                                    <div className="space-y-4">
                                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-muted/50 transition-colors">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                            <div className="text-sm text-muted-foreground">
                                                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                            </div>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="image-upload"
                                                onChange={handleUpload}
                                                disabled={isUploading}
                                            />
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => document.getElementById('image-upload')?.click()}
                                                disabled={isUploading}
                                                type="button"
                                            >
                                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {isUploading ? 'Uploading...' : 'Select File'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {isLoadingGallery ? (
                                            <div className="flex justify-center p-4">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : galleryImages.length === 0 ? (
                                            <div className="text-center text-sm text-muted-foreground p-4">
                                                No images found
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                                                {galleryImages.map((img) => (
                                                    <button
                                                        key={img.name}
                                                        className={cn(
                                                            "relative aspect-square rounded-md overflow-hidden border hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary",
                                                            value === img.url && "border-primary ring-2 ring-primary"
                                                        )}
                                                        onClick={() => {
                                                            onChange(img.url)
                                                            setIsOpen(false)
                                                        }}
                                                        type="button"
                                                    >
                                                        <img
                                                            src={img.url}
                                                            alt={img.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
    )
}
