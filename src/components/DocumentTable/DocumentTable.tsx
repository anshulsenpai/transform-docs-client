/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import moment from "moment-timezone";
import { IDocuments } from "../../consts/documents";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { userRequest } from "../../services/api";
import ShareDocumentModal from "./ShareDocumentModal";
import UnshareDocumentModal from "./UnshareDocumentModal";
import toast from "react-hot-toast";
import { documentCategories } from "../../consts/documentCategories";

interface DocumentTableProps {
    documents: IDocuments[];
    onFraudStatusChange?: (docId: string, status: string) => void;
    showSharedInfo?: boolean;
    onDocumentUpdated?: () => void; // Callback to refresh parent component
}

interface FilterState {
    searchTerm: string;
    category: string;
    status: string;
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

    // Modal states
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [unshareModalOpen, setUnshareModalOpen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<IDocuments | null>(null);
    
    // Filter states
    const [filteredDocuments, setFilteredDocuments] = useState<IDocuments[]>(documents);
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: "",
        category: "",
        status: ""
    });
    
    // Update filtered documents when source documents change
    useEffect(() => {
        applyFilters();
    }, [documents, filters]);
    
    // Apply filters to documents
    const applyFilters = () => {
        let result = [...documents];
        
        // Apply search term
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            result = result.filter(doc => 
                doc.name.toLowerCase().includes(searchLower) || 
                (doc.category && doc.category.toLowerCase().includes(searchLower))
            );
        }
        
        // Apply category filter
        if (filters.category) {
            result = result.filter(doc => doc.category === filters.category);
        }
        
        // Apply status filter
        if (filters.status) {
            result = result.filter(doc => doc.fraudStatus === filters.status);
        }
        
        setFilteredDocuments(result);
    };
    
    // Update a single filter
    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({...prev, [key]: value}));
    };
    
    // Reset all filters
    const resetFilters = () => {
        setFilters({
            searchTerm: "",
            category: "",
            status: ""
        });
    };

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
    
    // Get status badge styling
    const getStatusBadgeClass = (status: string) => {
        switch(status) {
            case 'verified':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'suspicious':
                return 'bg-orange-100 text-orange-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    // Get category label
    const getCategoryLabel = (categoryKey: string) => {
        const category = documentCategories.find(c => c.key === categoryKey);
        return category ? category.label : categoryKey;
    };

    return (
        <>
            {/* Table Header with Actions */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 sm:px-6 rounded-t-lg flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h2 className="text-sm font-medium text-gray-700">
                        {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} found
                        {(filters.searchTerm || filters.category || filters.status) && 
                            " with filters applied"}
                    </h2>
                </div>
                <div className="flex items-center space-x-2">
                    {(filters.searchTerm || filters.category || filters.status) && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <i className="fa-solid fa-filter-circle-xmark mr-1.5 text-gray-500"></i>
                            Clear Filters
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setFilterModalOpen(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <i className="fa-solid fa-filter mr-1.5 text-gray-500"></i>
                        Filter
                    </button>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            className="w-48 rounded-md border border-gray-300 shadow-sm px-3 py-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {filters.searchTerm && (
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => handleFilterChange('searchTerm', '')}
                            >
                                <i className="fa-solid fa-times-circle"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="w-full max-h-[60vh] overflow-auto bg-white rounded-b-lg shadow-sm">
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-gray-50 text-gray-500 uppercase tracking-wider text-xs z-10">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium border-b border-gray-200">Title</th>
                            <th className="px-4 py-3 text-left font-medium border-b border-gray-200">Category</th>
                            <th className="px-4 py-3 text-left font-medium border-b border-gray-200">Uploaded Date</th>
                            <th className="px-4 py-3 text-left font-medium border-b border-gray-200">Time</th>
                            {showSharedInfo && <th className="px-4 py-3 text-left font-medium border-b border-gray-200">Shared By</th>}
                            <th className="px-4 py-3 text-left font-medium border-b border-gray-200">Status</th>
                            <th className="px-4 py-3 text-center font-medium border-b border-gray-200">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredDocuments.length > 0 ? (
                            filteredDocuments.map((doc, index) => {
                                // Count the number of users the document is shared with
                                const sharedWithCount = doc.sharedWith
                                    ? Array.isArray(doc.sharedWith)
                                        ? doc.sharedWith.length
                                        : 1
                                    : 0;

                                return (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium">{doc.name}</span>
                                                {doc.isShared && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        <i className="fa-solid fa-share-nodes mr-1 text-xs"></i>
                                                        Shared
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {getCategoryLabel(doc.category)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                            {moment(doc.createdAt).format("DD-MM-YYYY")}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                            {moment(doc.createdAt)
                                                .tz("Asia/Kolkata")
                                                .format("LT")}
                                        </td>
                                        {showSharedInfo && (
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="flex items-center">
                                                    {typeof doc.sharedBy === "object" && doc.sharedBy
                                                        ? (
                                                            <span className="inline-flex items-center">
                                                                <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                                                                    {doc.sharedBy.name.charAt(0).toUpperCase()}
                                                                </span>
                                                                {doc.sharedBy.name}
                                                            </span>
                                                        )
                                                        : `Unknown (${doc.sharedBy})`}
                                                    {doc.sharingNote && (
                                                        <div className="relative group ml-2">
                                                            <i
                                                                className="fa-solid fa-circle-info text-indigo-500 cursor-pointer"
                                                                title="Sharing note"
                                                            />
                                                            <div className="absolute z-20 hidden group-hover:block left-0 mt-2 w-64 p-2 bg-white border border-gray-300 rounded shadow-lg text-xs text-gray-700">
                                                                <div className="font-bold mb-1">Note:</div>
                                                                {doc.sharingNote}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-gray-700">
                                            <div className="flex items-center">
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
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(doc.fraudStatus)}`}>
                                                        {doc.fraudStatus.charAt(0).toUpperCase() + doc.fraudStatus.slice(1)}
                                                    </span>
                                                )}
                                                {["suspicious", "rejected"].includes(
                                                    doc.fraudStatus
                                                ) &&
                                                    doc.fraudReason && (
                                                        <div className="relative group ml-2">
                                                            <i
                                                                className="fa-solid fa-circle-info text-indigo-500 cursor-pointer"
                                                                title="Click to see reason"
                                                            />
                                                            <div className="absolute z-20 hidden group-hover:block left-1/2 -translate-x-1/2 mt-2 w-64 p-2 bg-white border border-gray-300 rounded shadow-lg text-xs text-gray-700">
                                                                <div className="font-bold mb-1">Reason:</div>
                                                                {doc.fraudReason}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleDownloadDocument(doc)}
                                                    className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                                                    title="Download"
                                                >
                                                    <i className="fa-solid fa-file-arrow-down" />
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleShareDocument(doc)}
                                                        className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                                                        title="Share Document"
                                                    >
                                                        <i className="fa-solid fa-share-nodes" />
                                                    </button>
                                                )}
                                                {isAdmin &&
                                                    doc.isShared &&
                                                    sharedWithCount > 0 && (
                                                        <button
                                                            onClick={() => handleUnshareDocument(doc)}
                                                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
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
                                    className="px-4 py-12 text-center text-gray-500"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-gray-100 rounded-full p-3 mb-3">
                                            <i className="fa-solid fa-file-circle-question text-gray-400 text-2xl"></i>
                                        </div>
                                        <p className="font-medium">No Documents Found</p>
                                        {(filters.searchTerm || filters.category || filters.status) && (
                                            <p className="text-sm mt-1 max-w-md">
                                                Try adjusting your filter criteria
                                            </p>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Filter Modal */}
            {filterModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-medium text-gray-900">Filter Documents</h3>
                            <button 
                                onClick={() => setFilterModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Search input */}
                            <div>
                                <label htmlFor="filter-search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Search
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fa-solid fa-search text-gray-400"></i>
                                    </div>
                                    <input
                                        id="filter-search"
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Search by document name"
                                        value={filters.searchTerm}
                                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {/* Category filter */}
                            <div>
                                <label htmlFor="filter-category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    id="filter-category"
                                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {documentCategories.map((category) => (
                                        <option key={category.key} value={category.key}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Status filter */}
                            <div>
                                <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    id="filter-status"
                                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    {fraudStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterModalOpen(false)}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Unshare Document Modal */}
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