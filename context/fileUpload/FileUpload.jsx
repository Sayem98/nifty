"use client"
import axios from 'axios';
import Image from 'next/image';
import React from 'react'
import { useState } from 'react'

const FileUpload = () => {

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/api/s3-upload", formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });

            setUploading(false);
        }
        catch(error){
            console.error(err);
            setUploading(false);

        }
    }   

  return (
    <form onSubmit={handleSubmit}>
        <label for="dropzone-file" class="flex flex-col items-center justify-center w-40 h-40 border-2 border-jel-gray-3 border-dashed rounded-lg cursor-pointer hover:bg-jel-gray-1">
            <div class="flex flex-col items-center overflow-hidden justify-center rounded-lg">
                {!file ? <svg class="w-8 h-8 text-jel-gray-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>:
                <Image className='w-ful h-full object-cover hover:scale-110 hover:opacity-30 duration-300' width={1000} height={1000} src={!file ? "" : (file instanceof File ? URL.createObjectURL(file) : file)}/>}
            </div>
            <input id="dropzone-file" type="file" accept='image/*' onChange={handleFileChange} class="hidden" />
        </label>
        <button onClick={handleSubmit} disabled={uploading} className=' col-span-2 w-32 py-2 font-medium text-black rounded-xl hover:-translate-y-[0.3rem] duration-200 bg-jel-gray-3 hover:bg-jel-gray-2 text-nowrap mt-2'>{uploading ? "Upload" : "Uploading..."}</button>
    </form>
  )
}

export default FileUpload