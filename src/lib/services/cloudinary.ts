
//upload audio
export async function uploadAudio(audioBlob: Blob) {

    const formData = new FormData();

    formData.append("file", audioBlob);

    formData.append("upload_preset", "zingram_audio");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/k72a60mm/video/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    return data.secure_url;
}

//upload photo
export async function uploadImage(file: File) {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', 'zingram_avatar');

    const response = await fetch(
        'https://api.cloudinary.com/v1_1/k72a60mm/image/upload',
        {
            method: 'POST',
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error('Image upload failed');
    }

    const data = await response.json();

    return data.secure_url;
}

//upload vedio
export async function uploadVideo(file: File) {

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", "zingram_video");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/k72a60mm/video/upload",
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        console.log(await response.json());
        throw new Error("Video upload failed");
    }

    const data = await response.json();

    return data.secure_url;
}

// upload document
export async function uploadDocument(file: File) {

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", "zingram_document");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/k72a60mm/raw/upload",
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error("Document upload failed");
    }

    const data = await response.json();

    return data.secure_url;
}