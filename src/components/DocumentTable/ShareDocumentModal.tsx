import React, { useState, useEffect, useRef } from "react";
import { userRequest } from "../../services/api";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  currentSharedWith?: string[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const ShareDocumentModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  documentId,
  documentName,
  currentSharedWith = []
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(currentSharedWith);
  const [sharingNote, setSharingNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch users that can be shared with
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const response = await userRequest.get("/user/get-users");
      
      // Filter out admins, only show regular users
      const userList = response.data.data.users.filter(
        (u: User) => u.role === "user"
      );
      
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const filteredUsers = filterUsers();
    if (selectedUsers.length === filteredUsers.length) {
      // If all filtered users are selected, deselect all filtered users
      const filteredUserIds = filteredUsers.map(user => user._id);
      setSelectedUsers(prev => prev.filter(id => !filteredUserIds.includes(id)));
    } else {
      // Otherwise, add all filtered users to selection
      const newSelectedUsers = [...selectedUsers];
      filteredUsers.forEach(user => {
        if (!newSelectedUsers.includes(user._id)) {
          newSelectedUsers.push(user._id);
        }
      });
      setSelectedUsers(newSelectedUsers);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  };

  const handleClearAll = () => {
    setSelectedUsers([]);
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to share with");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await userRequest.post("/documents/share-document", {
        documentId,
        userIds: selectedUsers,
        note: sharingNote
      });
      
      setSuccess("Document shared successfully");
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to share document");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filterUsers = () => {
    if (!searchQuery.trim()) return users;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowercaseQuery) || 
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Get user object by ID
  const getUserById = (id: string) => {
    return users.find(user => user._id === id);
  };

  if (!isOpen) return null;

  const filteredUsers = filterUsers();
  const areAllFilteredUsersSelected = filteredUsers.length > 0 && 
    filteredUsers.every(user => selectedUsers.includes(user._id));

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 transform transition-all animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-800">Share Document</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        {/* Document preview */}
        <div className="mb-5 p-4 bg-indigo-50 rounded-lg">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <i className="fa-solid fa-file-lines text-indigo-500 text-xl"></i>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{documentName}</h4>
              <p className="text-xs text-gray-500 mt-1">
                Share this document with your team members
              </p>
            </div>
          </div>
        </div>
        
        {/* Error and success messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm animate-slideIn">
            <div className="flex">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md text-sm animate-slideIn">
            <div className="flex">
              <i className="fa-solid fa-circle-check mr-2"></i>
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Multi-select dropdown */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select users to share with
          </label>
          
          {fetchingUsers ? (
            <div className="p-4 bg-gray-50 rounded-lg flex justify-center">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-spinner animate-spin text-indigo-600"></i>
                <span className="text-sm text-gray-500">Loading users...</span>
              </div>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown trigger */}
              <div 
                className="w-full p-2 border border-gray-300 rounded-lg bg-white flex items-center cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedUsers.length === 0 ? (
                  <span className="text-gray-500 text-sm">Select users to share with</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedUsers.map((userId, index) => {
                      const user = getUserById(userId);
                      if (!user) return null;
                      
                      if (index < 2) {
                        return (
                          <div key={userId} className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs rounded-full px-2 py-1">
                            {user.name}
                          </div>
                        );
                      } else if (index === 2) {
                        return (
                          <div key="more" className="inline-flex items-center bg-gray-100 text-gray-800 text-xs rounded-full px-2 py-1">
                            +{selectedUsers.length - 2} more
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
                <div className="ml-auto flex items-center">
                  {selectedUsers.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearAll();
                      }}
                      className="text-gray-400 hover:text-gray-600 mr-2"
                      aria-label="Clear selection"
                    >
                      <i className="fa-solid fa-times-circle"></i>
                    </button>
                  )}
                  <i className={`fa-solid fa-chevron-${dropdownOpen ? 'up' : 'down'} text-gray-400`}></i>
                </div>
              </div>
              
              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {/* Search box */}
                  <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fa-solid fa-search text-gray-400 text-sm"></i>
                      </div>
                      <input
                        type="text"
                        className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Search users"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {searchQuery && (
                        <button
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchQuery("");
                          }}
                        >
                          <i className="fa-solid fa-times-circle text-gray-400 hover:text-gray-600"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Select all option */}
                  {filteredUsers.length > 0 && (
                    <div 
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAll();
                      }}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded border ${areAllFilteredUsersSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'} flex items-center justify-center mr-3`}>
                          {areAllFilteredUsersSelected && <i className="fa-solid fa-check text-white text-xs"></i>}
                        </div>
                        <span className="text-sm font-medium">
                          {searchQuery 
                            ? `Select all matching (${filteredUsers.length})` 
                            : 'Select all users'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* User list */}
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div 
                        key={user._id} 
                        className={`p-2 hover:bg-gray-50 cursor-pointer ${selectedUsers.includes(user._id) ? 'bg-indigo-50' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserSelection(user._id);
                        }}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded border ${selectedUsers.includes(user._id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'} flex items-center justify-center mr-3`}>
                            {selectedUsers.includes(user._id) && <i className="fa-solid fa-check text-white text-xs"></i>}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">No users found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Selected users chips */}
        {selectedUsers.length > 0 && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected users ({selectedUsers.length})
            </label>
            <div className="p-2 bg-gray-50 rounded-lg max-h-24 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = getUserById(userId);
                  if (!user) return null;
                  
                  return (
                    <div key={userId} className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs rounded-full py-1 pl-2 pr-1">
                      <span className="mr-1">{user.name}</span>
                      <button
                        onClick={() => handleRemoveUser(userId)}
                        className="w-4 h-4 rounded-full bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center"
                        aria-label={`Remove ${user.name}`}
                      >
                        <i className="fa-solid fa-xmark text-xs"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Note field */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a note (optional)
          </label>
          <textarea
            value={sharingNote}
            onChange={(e) => setSharingNote(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Add context about why you're sharing this document"
            rows={3}
          />
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
            onClick={handleShare}
            disabled={loading || selectedUsers.length === 0}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center
              ${(loading || selectedUsers.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin mr-2"></i>
                Sharing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-share-nodes mr-2"></i>
                Share with {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDocumentModal;