import { useEffect, useState } from "react";
import { userRequest } from "../../services/api";
import DocumentTable from "../../components/DocumentTable";

function SharedDocument() {
    const [documents, setDocuments] = useState([]);

    const fetchRecentDocuments = async () => {
        try {
            const { documents } = (await userRequest.get(`/documents/get-shared-document`)).data.data;
            setDocuments(documents);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchRecentDocuments();
    }, [])

    return (
        <main>
            <div className="bg-white border-b border-gray-200 mb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl sm:truncate">
                                Shared Documents
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Access, view, and download documents shared with you
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <DocumentTable
                    documents={documents}
                />
            </div>
        </main>
    )
}

export default SharedDocument;