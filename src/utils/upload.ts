import imageCompression from 'browser-image-compression'

type UploadResponse = {
  message: string
  url?: string
  filename?: string
}

export async function uploadMedia(
  file: File
): Promise<UploadResponse | undefined> {
  try {
    let compressedFile = file

    // Compressão de imagens
    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 1, // Tamanho máximo do arquivo em MB
        maxWidthOrHeight: 800, // Largura ou altura máxima
        useWebWorker: true,
      }
      compressedFile = await imageCompression(file, options)
    }

    const formData = new FormData()
    formData.append('file', compressedFile)
    formData.append('filename', file.name)

    const response = await fetch(`/api/upload?kinde_id=`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Erro ao fazer upload')
    }

    const data: UploadResponse = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao fazer upload da mídia:', error)
  }
}
