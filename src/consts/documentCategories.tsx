export interface DocumentCategory {
    key: string;      // Unique identifier
    label: string;    // Display name
    icon: string;     // FontAwesome icon class
}

export const documentCategories: DocumentCategory[] = [
    { key: "question-paper", label: "Question Papers", icon: "fa-solid fa-file-circle-question" },
    { key: "notice", label: "Notices", icon: "fa-solid fa-bullhorn" },
    { key: "score-card", label: "Score Cards", icon: "fa-solid fa-chart-line" },
    { key: "certificate", label: "Certificates", icon: "fa-solid fa-award" },
    { key: "invoice", label: "Invoices", icon: "fa-solid fa-file-invoice" },
    { key: "id-card", label: "ID Cards", icon: "fa-solid fa-id-card" },
    { key: "medical-record", label: "Medical Records", icon: "fa-solid fa-notes-medical" },
    { key: "bank-statement", label: "Bank Statements", icon: "fa-solid fa-file-invoice-dollar" },
    { key: "report", label: "Reports", icon: "fa-solid fa-file-alt" },
    { key: "admit-card", label: "Admit Cards", icon: "fa-solid fa-ticket-alt" },
    { key: "salary-slip", label: "Salary Slips", icon: "fa-solid fa-file-signature" },
    { key: "unclassified", label: "Unclassified", icon: "fa-solid fa-question-circle" },
];
