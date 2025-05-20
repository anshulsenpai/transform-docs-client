import { useEffect, useState } from "react";
import { userRequest } from "../../services/api";
import DocumentTable from "../../components/DocumentTable";

function AdminSharedDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAllSharedDocs = async () => {
        try {
            setLoading(true);
            const { documents } = (await userRequest.get(`/documents/all-shared-documents`)).data.data;
            setDocuments(documents);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllSharedDocs();
    }, []);

    return (
        <main>
            <div className="text-xs font-semibold mb-4 text-indigo-400 select-none">
                <h2><i className="fa-solid fa-house"></i> Dashboard {">"} Shared Documents</h2>
            </div>
            
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center">
                    <div className="mr-3 text-indigo-500">
                        <i className="fa-solid fa-circle-info text-xl"></i>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-800">Manage Document Access</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            View and manage all documents that have been shared with users. Click the red button to manage or remove access.
                        </p>
                    </div>
                </div>
            </div>
            
            <div>
                {loading ? (
                    <div className="flex justify-center items-center py-8 bg-white rounded-lg shadow-sm">
                        <div className="flex flex-col items-center">
                            <i className="fa-solid fa-spinner animate-spin text-indigo-600 text-xl mb-2"></i>
                            <p className="text-sm text-gray-500">Loading shared documents...</p>
                        </div>
                    </div>
                ) : (
                    <DocumentTable 
                        documents={documents} 
                        showSharedInfo={true} 
                        onDocumentUpdated={fetchAllSharedDocs}
                    />
                )}
            </div>
        </main>
    );
}

export default AdminSharedDocuments;