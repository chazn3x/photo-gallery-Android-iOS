import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera'
import { useState } from 'react'
import { Directory, Filesystem } from '@capacitor/filesystem'

export function usePhotoGallery() {
  const [photos, setPhotos] = useState<UserPhoto[]>([])

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    })

    const fileName = new Date().getTime() + '.jpeg'
    const savedFileImage = await savePicture(photo, fileName)
    const newPhotos = [savedFileImage, ...photos]
    setPhotos(newPhotos)
  }

  const savePicture =async (photo: Photo, fileName: string): Promise<UserPhoto> => {
    const base64Data = await base64FromPath(photo.webPath!)
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    })
    return {
      filepath: fileName,
      webviewPath: photo.webPath
    }
  }

  return {
    photos,
    takePhoto
  }
}

export interface UserPhoto {
  filepath: string
  webviewPath?: string
}

export async function base64FromPath(path: string): Promise<string> {
  const response = await fetch(path)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject('method did not return a string')
      }
    }
    reader.readAsDataURL(blob)
  })
}