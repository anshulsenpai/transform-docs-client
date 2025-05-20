/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import moment from "moment-timezone";
import { IDocuments } from "../../consts/documents";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { userRequest } from "../../services/api";
import ShareDocumentModal from "./ShareDocumentModal";
import UnshareDocumentModal from "./UnshareDocumentModal";
import toast from "react-hot-toast";

interface DocumentTableProps {
    documents: IDocuments[];
    onFraudStatusChange?: (docId: string, status: string) => void;
    showSharedInfo?: boolean;
    onDocumentUpdated?: () => void; // Callback to refresh parent component
}

const fraudStatuses = ["pending", "suspicious", "verified", "rejected"];

const DocumentTable: React.FC<DocumentTableProps> = ({
    documents,
    onFraudStatusChange,
    showSharedInfo = false,
    onDocumentUpdated,
}) => {
    const role = useSelector((state: RootState) => state.auth.user?.role);
    const isAdmin = role === "admin";

    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [unshareModalOpen, setUnshareModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<IDocuments | null>(null);

    const handleDownloadDocument = async (doc: IDocuments) => {
        try {
            const res = await userRequest.get(`documents/download/${doc._id}`, {
                responseType: "blob",
            });
            const blob = new Blob([res.data], { type: res.headers["content-type"] });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = doc.name || "downloaded-document";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            toast.success("Document downloaded successfully");
        } catch (error) {
            console.error("Error downloading document:", error);
            toast.error("Failed to download document");
        }
    };

    const handleShareDocument = (doc: IDocuments) => {
        setSelectedDoc(doc);
        setShareModalOpen(true);
    };

    const handleUnshareDocument = (doc: IDocuments) => {
        // If there's only one user, handle directly
        if (doc.sharedWith && Array.isArray(doc.sharedWith) && doc.sharedWith.length === 1) {
            const userId = typeof doc.sharedWith[0] === 'object' 
                ? (doc.sharedWith[0] as any)._id 
                : doc.sharedWith[0];
                
            handleDirectUnshare(doc._id, userId);
        } 
        // If there are multiple users, open the modal
        else if (doc.sharedWith && Array.isArray(doc.sharedWith) && doc.sharedWith.length > 1) {
            setSelectedDoc(doc);
            setUnshareModalOpen(true);
        }
    };
    
    const handleDirectUnshare = async (docId: string, userId: string) => {
        try {
            await userRequest.post("/documents/unshare-document", {
                documentId: docId,
                userId,
            });
            toast.success("Document unshared successfully");
            
            // Refresh the data
            if (onDocumentUpdated) {
                onDocumentUpdated();
            }
        } catch (error) {
            console.error("❌ Failed to unshare document:", error);
            toast.error("Failed to unshare document");
        }
    };

    return (
        <>
            <div className="w-full max-h-[60vh] overflow-auto rounded-lg bg-white shadow-sm">
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-indigo-900 text-white z-10">
                        <tr>
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Category</th>
                            <th className="px-4 py-2 text-left">Uploaded Date</th>
                            <th className="px-4 py-2 text-left">Time</th>
                            {showSharedInfo && <th className="px-4 py-2 text-left">Shared By</th>}
                            <th className="px-4 py-2 text-left">Fraud Status</th>
                            <th className="px-4 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.length > 0 ? (
                            documents.map((doc, index) => {
                                // Count the number of users the document is shared with
                                const sharedWithCount = doc.sharedWith
                                    ? Array.isArray(doc.sharedWith)
                                        ? doc.sharedWith.length
                                        : 1
                                    : 0;

                                return (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-2 font-medium text-gray-700">
                                            {doc.name}
                                            {doc.isShared && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    <i className="fa-solid fa-share-nodes mr-1 text-xs"></i>
                                                    Shared
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">{doc.category}</td>
                                        <td className="px-4 py-2 text-gray-600">
                                            {moment(doc.createdAt).format("DD-MM-YYYY")}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">
                                            {moment(doc.createdAt)
                                                .tz("Asia/Kolkata")
                                                .format("LT")}
                                        </td>
                                        {showSharedInfo && (
                                            <td className="px-4 py-2 text-gray-600">
                                                {typeof doc.sharedBy === "object"
                                                    ? doc.sharedBy?.name
                                                    : `Unknown (${doc.sharedBy})`}
                                                {doc.sharingNote && (
                                                    <div className="relative group">
                                                        <i
                                                            className="fa-solid fa-circle-info text-indigo-500 cursor-pointer ml-1"
                                                            title="Sharing note"
                                                        />
                                                        <div className="absolute z-10 hidden group-hover:block left-0 mt-2 w-64 p-2 bg-white border border-gray-300 rounded shadow text-xs text-gray-700">
                                                            {doc.sharingNote}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-4 py-2 text-gray-700">
                                            <div className="flex items-center gap-2">
                                                {isAdmin && onFraudStatusChange ? (
                                                    <select
                                                        value={doc.fraudStatus}
                                                        onChange={(e) =>
                                                            onFraudStatusChange(
                                                                doc._id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="px-2 py-1 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                    >
                                                        {fraudStatuses.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status.charAt(0).toUpperCase() +
                                                                    status.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="capitalize">
                                                        {doc.fraudStatus}
                                                    </span>
                                                )}
                                                {["suspicious", "rejected"].includes(
                                                    doc.fraudStatus
                                                ) &&
                                                    doc.fraudReason && (
                                                        <div className="relative group">
                                                            <i
                                                                className="fa-solid fa-circle-info text-indigo-500 cursor-pointer"
                                                                title="Click to see reason"
                                                            />
                                                            <div className="absolute z-10 hidden group-hover:block left-1/2 -translate-x-1/2 mt-2 w-64 p-2 bg-white border border-gray-300 rounded shadow text-xs text-gray-700">
                                                                {doc.fraudReason}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleDownloadDocument(doc)
                                                    }
                                                    className="text-indigo-600 hover:text-indigo-800"
                                                    title="Download"
                                                >
                                                    <i className="fa-solid fa-file-arrow-down" />
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() =>
                                                            handleShareDocument(doc)
                                                        }
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Share Document"
                                                    >
                                                        <i className="fa-solid fa-share-nodes" />
                                                    </button>
                                                )}
                                                {isAdmin &&
                                                    doc.isShared &&
                                                    sharedWithCount > 0 && (
                                                        <button
                                                            onClick={() =>
                                                                handleUnshareDocument(doc)
                                                            }
                                                            className="text-red-600 hover:text-red-800"
                                                            title={`Manage Access (${sharedWithCount} user${sharedWithCount > 1 ? 's' : ''})`}
                                                        >
                                                            <div className="relative">
                                                                <i className="fa-solid fa-user-xmark" />
                                                                {sharedWithCount > 1 && (
                                                                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                                                        {sharedWithCount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={showSharedInfo ? 7 : 6}
                                    className="px-4 py-6 text-center text-gray-500 font-medium"
                                >
                                    No Documents Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Share Document Modal */}
            {shareModalOpen && selectedDoc && (
                <ShareDocumentModal
                    isOpen={shareModalOpen}
                    onClose={() => {
                        setShareModalOpen(false);
                        setSelectedDoc(null);
                        if (onDocumentUpdated) onDocumentUpdated();
                    }}
                    documentId={selectedDoc._id}
                    documentName={selectedDoc.name}
                />
            )}

            {/* Unshare Document Modal - now passes populated sharedWith array */}
            {unshareModalOpen && selectedDoc && selectedDoc.sharedWith && (
                <UnshareDocumentModal
                    isOpen={unshareModalOpen}
                    onClose={() => {
                        setUnshareModalOpen(false);
                        setSelectedDoc(null);
                    }}
                    documentId={selectedDoc._id}
                    documentName={selectedDoc.name}
                    sharedWith={selectedDoc.sharedWith as any[]}
                    onUnshareComplete={onDocumentUpdated}
                />
            )}
        </>
    );
};

export default DocumentTable;