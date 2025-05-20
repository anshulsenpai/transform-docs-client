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
            <div className="text-xs font-semibold mb-4 text-indigo-400 select-none">
                <h2> <i className="fa-solid fa-house"></i> Dashboard {">"} Documents</h2>
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