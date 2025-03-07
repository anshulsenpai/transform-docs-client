import React from "react";
import moment from "moment-timezone";
import { IDocuments } from "../../consts/documents";
import { userRequest } from "../../services/api";
import filterIcon from "../../assests/filter.png";

interface DocumentTableProps {
    documents: IDocuments[];
    searchKey: string;
    setSearchKey: React.Dispatch<React.SetStateAction<string>>;
}

const DocumentTable: React.FC<DocumentTableProps> = ({ documents = [], searchKey = '', setSearchKey }) => {
    const handleDownloadDocument = async (doc: IDocuments) => {
        try {
            const res = await userRequest.get(`documents/download/${doc._id}`, {
                responseType: "blob", // Important to receive binary data
            });

            // Create a blob from the response data
            const blob = new Blob([res.data], { type: res.headers["content-type"] });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary anchor element
            const a = document.createElement("a");
            a.href = url;
            a.download = doc.name || "downloaded-document"; // Use document name or fallback name
            document.body.appendChild(a);
            a.click();

            // Cleanup
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading document:", error);
        }
    };

    return (
        <div className="w-full max-h-[50vh] overflow-y-auto overflow-x-auto">
            {/* <div className="flex justify-between w-full my-4 px-2">
                <div className="w-fit border border-gray-300 rounded-lg">
                    <input autoComplete="off" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} placeholder="Search" className="py-2 px-4 text-sm outline-0" type="text"/>
                    <i className="fa-solid fa-magnifying-glass px-3"></i>
                </div>
                <button className="filter border flex items-center gap-2 px-2 py-1 text-white rounded-md cursor-pointer">
                    <img className="w-5" src={filterIcon} alt="filter icon" />
                </button>
            </div> */}
            <table className="w-full border-collapse">
                {/* Table Header */}
                <thead>
                    <tr className="bg-indigo-900 text-white text-sm">
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-left">Uploaded Date</th>
                        <th className="px-4 py-2 text-left">Time</th>
                        {/* <th className="px-4 py-2 text-center">Verified</th> */}
                        <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                    {documents.length > 0 ? documents.map((doc, index) => (
                        <tr key={index} className="border-b border-gray-300 hover:bg-gray-100">
                            <td className="px-4 py-2 text-sm font-semibold text-gray-600">{doc.name}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-600">{doc.category}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-600">{moment(doc.createdAt).format("DD-MM-YYYY")}</td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-600">{moment(doc.createdAt).tz("Asia/Kolkata").format("LT")}</td>
                            {/* <td className="px-4 py-2 text-center">
                                {doc.verified ? (
                                    <i className="fa-solid fa-circle-check text-green-500"></i>
                                ) : (
                                    <i className="fa-solid fa-circle-xmark text-red-500"></i>
                                )}
                            </td> */}
                            <td className="px-4 py-2 text-center">
                                <button onClick={() => handleDownloadDocument(doc)}>
                                    <i className="fa-solid fa-file-arrow-down text-indigo-500"></i>
                                </button>
                            </td>
                        </tr>
                    )) : <tr className="border-b border-gray-300 hover:bg-gray-100">
                        <td className="px-4 py-2 text-sm font-semibold text-gray-600 text-center" colSpan={6}>
                            No Documents Uploaded By You
                        </td>
                    </tr>}
                </tbody>
            </table>
        </div>
    );
};

export default DocumentTable;
