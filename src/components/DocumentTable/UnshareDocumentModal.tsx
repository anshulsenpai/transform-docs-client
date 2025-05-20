import React, { useState, useEffect } from "react";
import { userRequest } from "../../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface UnshareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  sharedWith: User[];
  onUnshareComplete?: () => void;
}

const UnshareDocumentModal: React.FC<UnshareModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentName,
  sharedWith,
  onUnshareComplete
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset selected users when modal opens or sharedWith changes
  useEffect(() => {
    if (isOpen) {
      setSelectedUsers([]);
    }
  }, [isOpen, sharedWith]);

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === sharedWith.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(sharedWith.map(user => user._id));
    }
  };

  const handleUnshare = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to remove access");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Process each user one by one
      await Promise.all(
        selectedUsers.map(async (userId) => {
          return userRequest.post("/documents/unshare-document", {
            documentId,
            userId
          });
        })
      );
      
      setSuccess(`Access removed for ${selectedUsers.length} user(s)`);
      
      // Callback to refresh parent component
      if (onUnshareComplete) {
        onUnshareComplete();
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (error) {
      console.error("❌ Failed to remove access:", error);
      setError("Failed to remove document access");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-800">Manage Document Access</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        {/* Document preview */}
        <div className="mb-5 p-4 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-start">
            <div className="mr-3 mt-1 text-red-500">
              <i className="fa-solid fa-file-circle-exclamation text-xl"></i>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{documentName}</h4>
              <p className="text-xs text-gray-500 mt-1">
                Select users to remove access from this document
              </p>
            </div>
          </div>
        </div>
        
        {/* Error and success messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
            <div className="flex">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md text-sm">
            <div className="flex">
              <i className="fa-solid fa-circle-check mr-2"></i>
              <span>{success}</span>
            </div>
          </div>
        )}
        
        {/* User selection area */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Users with access ({sharedWith.length})
            </label>
            {sharedWith.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                {selectedUsers.length === sharedWith.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          
          {sharedWith.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
              {sharedWith.map(user => (
                <div 
                  key={user._id} 
                  className={`p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${selectedUsers.includes(user._id) ? 'bg-red-50' : ''}`}
                >
                  <label className="flex items-center space-x-3 text-sm cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserSelection(user._id)}
                        className="hidden"
                      />
                      <div className={`w-5 h-5 rounded border ${selectedUsers.includes(user._id) ? 'bg-red-600 border-red-600' : 'border-gray-300'} flex items-center justify-center`}>
                        {selectedUsers.includes(user._id) && <i className="fa-solid fa-check text-white text-xs"></i>}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium text-gray-800">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-gray-50 rounded-lg">
              <i className="fa-solid fa-users-slash text-gray-400 text-2xl mb-2"></i>
              <p className="text-sm text-gray-500">No users have access to this document</p>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUnshare}
            disabled={loading || selectedUsers.length === 0}
            className={`px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center
              ${(loading || selectedUsers.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin mr-2"></i>
                Removing access...
              </>
            ) : (
              <>
                <i className="fa-solid fa-user-xmark mr-2"></i>
                Remove access {selectedUsers.length > 0 && `(${selectedUsers.length})`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnshareDocumentModal;