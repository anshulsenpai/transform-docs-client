import React, { useState } from "react";
import { userRequest } from "../../services/api";

const UploadForm: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!file || !name) {
            setMessage("⚠️ Please select a file and enter a document name.");
            return;
        }

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);
        formData.append("description", description);

        try {
            const response = await userRequest.post(
                "/documents/upload", // Adjust API URL
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Pass JWT token
                    },
                }
            );
            setCategory(response.data.data.category);
            setMessage(`✅ Upload successful! Document ID: ${response.data.data._id}`);
            setFile(null);
            setName("");
            setDescription("");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setMessage(`❌ Upload failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full mb-3">
            {message && (
                <div className={`p-3 text-sm rounded-lg mb-3 ${message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {message}
                    <br />
                    {message.startsWith("✅") && <span>Saved to {category}</span>}
                </div>
            )}

            <form onSubmit={handleUpload} className="">
                {/* File Input */}
                <div>
                    <div className="border-2 border-dashed border-gray-300 h-52 w-full flex justify-center items-center mb-4">
                        <form>
                            <label className="block">
                                <span className="sr-only">Choose profile photo</span>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="block text-sm text-gray-500 file:me-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-600 file:text-white
                                    hover:file:bg-indigo-700
                                    file:disabled:opacity-50 file:disabled:pointer-events-none"
                                />
                            </label>
                        </form>
                    </div>
                </div>

                {/* Document Name */}
                <div>
                    {/* <label className="block text-sm font-medium text-gray-700">Document Name *</label> */}
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mb-4 block w-full p-2 border border-gray-300 rounded-md text-xs font-semibold text-gray-500 placeholder-gray-500"
                        placeholder="Document Name"
                        required
                    />
                </div>

                {/* Description (Optional) */}
                <div>
                    {/* <label className="block text-sm font-medium text-gray-700">Description</label> */}
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mb-4 resize-none block w-full md:h-9 p-2 border border-gray-300 rounded-md text-xs font-semibold text-gray-500 placeholder-gray-500"
                        rows={3}
                        placeholder="Description"
                    ></textarea>
                </div>

                {/* Upload Button */}
                <button
                    type="submit"
                    className="w-full text-xs h-12 mt-1 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-all"
                    disabled={uploading}
                >
                    {uploading ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-file-arrow-up"></i> <span className="ml-1">Upload</span></>}
                </button>
            </form>
        </div>
    );
};

export default UploadForm;
