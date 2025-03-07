import { useEffect, useState } from "react";
import { userRequest } from "../../services/api";
import DocumentTable from "../../components/DocumentTable";
import { useLocation } from "react-router-dom";

function Document() {
    const query = useLocation().search;
    const [documents, setDocuments] = useState([]);
    const [searchKey, setSearchKey] = useState('');

    const fetchRecentDocuments = async () => {
        try {
            const { documents } = (await userRequest.get(`/documents/get-document${query}`)).data.data;
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
                    setSearchKey={setSearchKey}
                    searchKey={searchKey}
                    documents={documents}
                />
            </div>
        </main>
    )
}

export default Document