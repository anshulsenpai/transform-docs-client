import React, { useEffect, useState } from "react";
import { documentCategories } from "../../consts/documentCategories";
import UploadForm from "./UploadForm";
import { userRequest } from "../../services/api";
import { useNavigate } from "react-router-dom";
import DocumentTable from "../../components/DocumentTable";
import { IDocuments } from "../../consts/documents";

// Status badges with consistent styling
// const StatusBadge: React.FC<{ status: string; count?: number }> = ({ status, count }) => {
//     const getStatusConfig = () => {
//         switch (status.toLowerCase()) {
//             case 'verified':
//                 return { bg: 'bg-green-100', text: 'text-green-600', icon: 'fa-solid fa-check-circle' };
//             case 'pending':
//                 return { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: 'fa-solid fa-clock' };
//             case 'rejected':
//                 return { bg: 'bg-red-100', text: 'text-red-600', icon: 'fa-solid fa-times-circle' };
//             case 'suspicious':
//                 return { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'fa-solid fa-exclamation-circle' };
//             default:
//                 return { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'fa-solid fa-file' };
//         }
//     };

//     const config = getStatusConfig();

//     return (
//         <span className={`inline-flex items-center rounded-full ${config.bg} px-2.5 py-0.5`}>
//             <i className={`${config.icon} mr-1 text-xs ${config.text}`}></i>
//             <span className={`text-xs font-medium ${config.text}`}>
//                 {status} {count !== undefined && `(${count})`}
//             </span>
//         </span>
//     );
// };

// Skeleton loader for stats cards
const StatCardSkeleton: React.FC = () => (
    <div className="animate-pulse bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between">
            <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="p-2 rounded-md bg-gray-200 h-10 w-10"></div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<IDocuments[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        pending: 0,
        rejected: 0,
        suspicious: 0,
    });
    const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'verified' | 'pending'>('all');
    const [isUploadFormVisible, setIsUploadFormVisible] = useState<boolean>(false);

    // Fetch documents and stats
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await userRequest.get('/documents/get-document');
            const documents = response.data.data.documents;
            setDocuments(documents);

            // Calculate document stats
            const stats = {
                total: documents.length,
                verified: documents.filter((doc: { fraudStatus: string; }) => doc.fraudStatus === 'verified').length,
                pending: documents.filter((doc: { fraudStatus: string; }) => doc.fraudStatus === 'pending').length,
                rejected: documents.filter((doc: { fraudStatus: string; }) => doc.fraudStatus === 'rejected').length,
                suspicious: documents.filter((doc: { fraudStatus: string; }) => doc.fraudStatus === 'suspicious').length,
            };
            setStats(stats);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAccess = (key: string) => {
        navigate(`/documents?category=${key}`);
    };

    const getFilteredDocuments = () => {
        switch (activeTab) {
            case 'verified':
                return documents.filter(doc => doc.fraudStatus === 'verified');
            case 'pending':
                return documents.filter(doc => doc.fraudStatus === 'pending');
            case 'recent':
                // Get documents from the last 7 days
                {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return documents.filter(doc => new Date(doc.createdAt) >= oneWeekAgo);
                }
            case 'all':
            default:
                return documents;
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const statCards = [
        { title: "Total Documents", value: stats.total, icon: "fa-solid fa-file-lines", color: "blue" },
        { title: "Verified", value: stats.verified, icon: "fa-solid fa-check-circle", color: "green" },
        { title: "Pending", value: stats.pending, icon: "fa-solid fa-clock", color: "yellow" },
        { title: "Issues", value: stats.rejected + stats.suspicious, icon: "fa-solid fa-triangle-exclamation", color: "red" }
    ];

    const filteredDocs = getFilteredDocuments();

    return (
        <div className="bg-gray-50 min-h-screen pb-8">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 mb-6 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl truncate">
                                My Documents
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} • Last updated {new Date().toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fetchData()}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={loading}
                            >
                                <i className={`fa-solid fa-arrows-rotate mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                                Refresh
                            </button>
                            <button
                                onClick={() => setIsUploadFormVisible(!isUploadFormVisible)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <i className="fa-solid fa-file-arrow-up mr-2"></i>
                                Upload Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Upload Form Section - Conditionally rendered */}
                {isUploadFormVisible && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 transition-all duration-300 ease-in-out">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Upload New Document</h2>
                            <button
                                onClick={() => setIsUploadFormVisible(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <UploadForm />
                    </div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {loading ? (
                        Array(4).fill(0).map((_, index) => <StatCardSkeleton key={index} />)
                    ) : (
                        statCards.map((card, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                                    </div>
                                    <div className={`p-2 rounded-md bg-${card.color}-100 h-fit`}>
                                        <i className={`${card.icon} text-${card.color}-600`}></i>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Category Access */}
                <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <i className="fa-solid fa-folder-open mr-2 text-indigo-500"></i>
                        Quick Access by Category
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {documentCategories.map((doc) => (
                            <button
                                key={doc.key}
                                className="bg-white flex flex-col items-center justify-center p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                onClick={() => handleQuickAccess(doc.key)}
                            >
                                <div className="p-3 rounded-full bg-indigo-100 mb-2">
                                    <i className={`${doc.icon} text-indigo-600 text-xl`}></i>
                                </div>
                                <p className="text-sm font-medium text-gray-700">{doc.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Document Tabs */}
                <div className="mb-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <i className="fa-solid fa-list-ul mr-2 text-indigo-500"></i>
                        My Documents
                    </h2>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                                <button
                                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'all'
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    <span className="flex items-center">
                                        <i className="fa-solid fa-file-lines mr-2"></i>
                                        All Documents
                                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-gray-100 text-gray-600">
                                            {stats.total}
                                        </span>
                                    </span>
                                </button>
                                <button
                                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'recent'
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    onClick={() => setActiveTab('recent')}
                                >
                                    <span className="flex items-center">
                                        <i className="fa-solid fa-clock-rotate-left mr-2"></i>
                                        Recent (7 days)
                                    </span>
                                </button>
                                <button
                                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'verified'
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    onClick={() => setActiveTab('verified')}
                                >
                                    <span className="flex items-center">
                                        <i className="fa-solid fa-check-circle mr-2"></i>
                                        Verified
                                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-green-100 text-green-600">
                                            {stats.verified}
                                        </span>
                                    </span>
                                </button>
                                <button
                                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'pending'
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    <span className="flex items-center">
                                        <i className="fa-solid fa-clock mr-2"></i>
                                        Pending
                                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-yellow-100 text-yellow-600">
                                            {stats.pending}
                                        </span>
                                    </span>
                                </button>
                            </nav>
                        </div>

                        {/* Empty state */}
                        {!loading && filteredDocs.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center p-6 rounded-full bg-gray-100 mb-4">
                                    <i className="fa-solid fa-file-circle-question text-gray-400 text-4xl"></i>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                                <p className="text-gray-500 mb-6">
                                    {activeTab === 'all' ? "You haven't uploaded any documents yet." :
                                        activeTab === 'recent' ? "No documents have been uploaded in the past 7 days." :
                                            activeTab === 'verified' ? "You don't have any verified documents." :
                                                "You don't have any pending documents."}
                                </p>
                                <button
                                    onClick={() => setIsUploadFormVisible(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <i className="fa-solid fa-file-arrow-up mr-2"></i>
                                    Upload Your First Document
                                </button>
                            </div>
                        )}

                        {/* Loading state */}
                        {loading && (
                            <div className="p-8 text-center">
                                <div className="inline-flex items-center justify-center p-4 rounded-full bg-indigo-100 mb-4">
                                    <i className="fa-solid fa-spinner animate-spin text-indigo-600 text-2xl"></i>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Loading your documents</h3>
                                <p className="text-gray-500">This may take a moment, please wait...</p>
                            </div>
                        )}

                        {/* Documents Table */}
                        {!loading && filteredDocs.length > 0 && (
                            <DocumentTable documents={filteredDocs} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;