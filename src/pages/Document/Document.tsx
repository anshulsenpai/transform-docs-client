import { useEffect, useState } from "react";
import { userRequest } from "../../services/api";
import DocumentTable from "../../components/DocumentTable";
import { useLocation } from "react-router-dom";
import { documentCategories } from "../../consts/documentCategories";
import { IDocuments } from "../../consts/documents";

interface FilterState {
  searchTerm: string;
  category: string;
  status: string;
  sortBy: string;
}

function Document() {
    const location = useLocation();
    const [documents, setDocuments] = useState<IDocuments[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<IDocuments[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Get URL query params
    const params = new URLSearchParams(location.search);
    const initialCategory = params.get('category') || '';
    const initialSearch = params.get('search') || '';
    const initialStatus = params.get('status') || '';
    const initialSort = params.get('sort') || 'newest';
    
    // State for filter controls
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: initialSearch,
        category: initialCategory,
        status: initialStatus,
        sortBy: initialSort
    });

    // Fetch documents based on URL query params
    const fetchDocuments = async () => {
        try {
            setLoading(true);
            
            // Convert filters to query string
            const queryParams = new URLSearchParams();
            if (filters.category) queryParams.set('category', filters.category);
            if (filters.status) queryParams.set('status', filters.status);
            
            const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
            const { documents } = (await userRequest.get(`/documents/get-document${query}`)).data.data;
            setDocuments(documents);
            
            // Apply client-side filters and sorting
            applyFilters(documents);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters and sorting client-side
    const applyFilters = (docs: IDocuments[]) => {
        let result = [...docs];
        
        // Apply search term
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            result = result.filter(doc => 
                doc.name.toLowerCase().includes(searchLower) || 
                doc.category.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply sort
        switch (filters.sortBy) {
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'a-z':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'z-a':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        
        setFilteredDocuments(result);
    };
    
    // Reset all filters
    const resetFilters = () => {
        setFilters({
            searchTerm: '',
            category: '',
            status: '',
            sortBy: 'newest'
        });
    };

    // Fetch documents when filters change via URL
    useEffect(() => {
        fetchDocuments();
    }, [location.search]);
    
    // Apply client-side filters when documents or filters change
    useEffect(() => {
        applyFilters(documents);
    }, [documents, filters.searchTerm, filters.sortBy]);

    return (
        <div className="bg-gray-50 min-h-screen pb-8">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 mb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl sm:truncate">
                                Documents
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Search and browse your documents
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">                
                {/* Results summary */}
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">
                        {loading ? (
                            <span className="text-gray-500">Loading documents...</span>
                        ) : (
                            <span>
                                Found <span className="font-bold">{filteredDocuments.length}</span> documents
                                {filters.searchTerm && (
                                    <span> matching "<span className="italic">{filters.searchTerm}</span>"</span>
                                )}
                                {filters.category && (
                                    <span> in <span className="text-indigo-600">{documentCategories.find(c => c.key === filters.category)?.label || filters.category}</span></span>
                                )}
                            </span>
                        )}
                    </h2>
                </div>

                {/* Documents Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-flex flex-col items-center justify-center">
                                <i className="fa-solid fa-spinner animate-spin text-indigo-600 text-2xl mb-2"></i>
                                <span className="text-gray-600">Loading documents...</span>
                            </div>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="inline-flex flex-col items-center justify-center">
                                <div className="bg-gray-100 rounded-full p-4 mb-4">
                                    <i className="fa-solid fa-file-circle-question text-gray-400 text-3xl"></i>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-4">
                                    {filters.searchTerm || filters.category || filters.status
                                        ? "Try adjusting your filters or search terms to find what you're looking for."
                                        : "You haven't uploaded any documents yet."}
                                </p>
                                {(filters.searchTerm || filters.category || filters.status) && (
                                    <button
                                        onClick={resetFilters}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <i className="fa-solid fa-filter-circle-xmark mr-2"></i>
                                        Reset All Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <DocumentTable documents={filteredDocuments} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Document;