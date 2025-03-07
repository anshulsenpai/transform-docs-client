import React, { useEffect, useState } from "react";
import { documentCategories } from "../../consts/documentCategories";
import UploadForm from "./UploadForm";
import { userRequest } from "../../services/api";
import { useNavigate } from "react-router-dom";
import DocumentTable from "../../components/DocumentTable";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [searchKey, setSearchKey] = useState('');

    const fetchRecentDocuments = async () => {
        try {
            const { documents } = (await userRequest.get('/documents/get-document')).data.data;
            setDocuments(documents);
        } catch (error) {
            console.error(error);
        }
    }

    const handleQuickAccess = async (key: string) => {
        navigate(`/documents?category=${key}`)
    }

    useEffect(() => {
        fetchRecentDocuments();
    }, []);

    return (
        <>
            {/* <div className="label text-sm font-bold text-gray-800 mb-2">
                Upload Document
            </div>
            <div className="upload-form">
                <UploadForm />
            </div>

            <div className="label text-sm font-bold text-gray-800 mb-2">
                Quick Access
            </div>
             */}

            <div className="text-xs font-semibold mb-4 text-indigo-400 select-none">
                <h2> <i className="fa-solid fa-house"></i> Dashboard {">"} Upload</h2>
            </div>

            <main className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {documentCategories.map((doc) => (
                    <button
                        key={doc.key}
                        className="card flex justify-start items-center border border-indigo-600 rounded px-2 py-2 gap-2 bg-indigo-100 shadow-md hover:bg-indigo-200 duration-300"
                        onClick={() => handleQuickAccess(doc.key)}
                    >
                        <div className="icon w-5">
                            <i className={`${doc.icon} text-indigo-600`}></i>
                        </div>
                        <div className="card-title">
                            <h6 className="text-xs m-0 text-indigo-600 font-semibold">{doc.label}</h6>
                        </div>
                    </button>
                ))}
            </main>

            <UploadForm />
            <br />
            <br />
            <div className="label text-sm font-bold text-gray-800 mb-2">
                <span>Recently Added</span>
            </div>
            <main>
                <DocumentTable documents={documents} searchKey={searchKey} setSearchKey={setSearchKey} />
            </main>

        </>
    );
};

export default Dashboard;
