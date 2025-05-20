export interface IDocuments {
    _id: string;
    name: string;
    filename: string;
    hash: string;
    uploadedBy: string | {
        _id: string;
        name: string;
        email: string;
    };
    category: string;
    createdAt: string;
    time: string;
    verified: boolean;
    fraudStatus: string;
    fraudReason: string;
    
    // Sharing-related fields
    isShared?: boolean;
    sharedWith?: Array<{
        _id: string;
        name: string;
        email: string;
    }> | string[];
    sharedBy?: {
        _id: string;
        name: string;
        email: string;
    } | string;
    sharedAt?: string;
    sharingNote?: string;
}