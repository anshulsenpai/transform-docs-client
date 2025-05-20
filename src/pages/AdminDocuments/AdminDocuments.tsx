import { useEffect, useState } from "react";
import { userRequest } from "../../services/api";
import DocumentTable from "../../components/DocumentTable";
import toast from "react-hot-toast";

function AdminDocuments() {
    // const query = useLocation().search;
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await userRequest.get(
                `/documents/get-all-document`
            );
            setDocuments(res.data.data.documents);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const handleFraudStatusChange = async (docId: string, status: string) => {
        try {
            await userRequest.put(`/documents/update-fraud-status/${docId}`, {
                fraudStatus: status,
            });
            toast.success("Fraud status updated");
            fetchDocuments(); // ✅ Refresh table
        } catch (error) {
            console.error("Failed to update fraud status:", error);
            toast.error("Update failed");
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <>
            <main className="p-4 space-y-6">
                <div className="text-sm font-semibold text-indigo-500 select-none">
                    <i className="fa-solid fa-house mr-1"></i> Dashboard {" > "} Documents
                </div>

                <DocumentTable
                    documents={documents}
                    onFraudStatusChange={handleFraudStatusChange}
                />
            </main>
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <svg
                            className="animate-spin h-10 w-10 text-indigo-600 mb-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            ></path>
                        </svg>
                        <p className="text-sm font-medium text-indigo-700">Loading documents...</p>
                    </div>
                </div>
            )}

        </>
    );
}

export default AdminDocuments;
