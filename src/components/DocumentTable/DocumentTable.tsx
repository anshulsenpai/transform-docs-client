import React from "react";
import moment from "moment-timezone";
import { IDocuments } from "../../consts/documents";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface DocumentTableProps {
    documents: IDocuments[];
    onFraudStatusChange: (docId: string, status: string) => void;
}

const fraudStatuses = ["pending", "suspicious", "verified", "rejected"];

const DocumentTable: React.FC<DocumentTableProps> = ({ documents, onFraudStatusChange }) => {
    const role = useSelector((state: RootState) => state.auth.user?.role);
    const isAdmin = role === "admin";

    const handleDownloadDocument = async (doc: IDocuments) => {
        try {
            const res = await fetch(`/api/documents/download/${doc._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = doc.name || "document";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading document:", error);
        }
    };

    return (
        <div className="w-full max-h-[60vh] overflow-auto rounded-lg bg-white shadow-sm">
            <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-indigo-900 text-white z-10">
                    <tr>
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-left">Uploaded Date</th>
                        <th className="px-4 py-2 text-left">Time</th>
                        <th className="px-4 py-2 text-left">Fraud Status</th>
                        <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.length > 0 ? (
                        documents.map((doc, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-700">{doc.name}</td>
                                <td className="px-4 py-2 text-gray-600">{doc.category}</td>
                                <td className="px-4 py-2 text-gray-600">
                                    {moment(doc.createdAt).format("DD-MM-YYYY")}
                                </td>
                                <td className="px-4 py-2 text-gray-600">
                                    {moment(doc.createdAt).tz("Asia/Kolkata").format("LT")}
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                    <div className="flex items-center gap-2">
                                        {isAdmin ? (
                                            <select
                                                value={doc.fraudStatus}
                                                onChange={(e) => onFraudStatusChange(doc._id, e.target.value)}
                                                className="px-2 py-1 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            >
                                                {fraudStatuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="capitalize">{doc.fraudStatus}</span>
                                        )}

                                        {/* Tooltip for suspicious or rejected with reason */}
                                        {["suspicious", "rejected"].includes(doc.fraudStatus) && doc.fraudReason && (
                                            <div className="relative group">
                                                <i
                                                    className="fa-solid fa-circle-info text-indigo-500 cursor-pointer"
                                                    title="Click to see reason"
                                                />
                                                <div className="absolute z-10 hidden group-hover:block left-1/2 -translate-x-1/2 mt-2 w-64 p-2 bg-white border border-gray-300 rounded shadow text-xs text-gray-700">
                                                    {doc.fraudReason}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => handleDownloadDocument(doc)}
                                        className="text-indigo-600 hover:text-indigo-800"
                                        title="Download"
                                    >
                                        <i className="fa-solid fa-file-arrow-down" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-gray-500 font-medium">
                                No Documents Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DocumentTable;
