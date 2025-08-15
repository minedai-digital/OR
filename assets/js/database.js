// Database Manager
class DatabaseManager {
    constructor() {
        this.operations = [];
        this.images = [];
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
    }

    // Local Storage Operations
    loadFromLocalStorage() {
        const operations = localStorage.getItem('operations');
        const images = localStorage.getItem('images');
        
        if (operations) {
            this.operations = JSON.parse(operations);
        }
        
        if (images) {
            this.images = JSON.parse(images);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('operations', JSON.stringify(this.operations));
        localStorage.setItem('images', JSON.stringify(this.images));
    }

    // Operations CRUD
    async addOperation(operationData) {
        const operation = {
            id: Date.now().toString(),
            ...operationData,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        
        this.operations.push(operation);
        this.saveToLocalStorage();
        return operation;
    }

    async getOperations(filters = {}) {
        let filteredOperations = [...this.operations];
        
        if (filters.date) {
            filteredOperations = filteredOperations.filter(op => op.date === filters.date);
        }
        
        if (filters.operationType) {
            filteredOperations = filteredOperations.filter(op => op.operationType === filters.operationType);
        }
        
        if (filters.surgeonName) {
            filteredOperations = filteredOperations.filter(op => 
                op.surgeonName.toLowerCase().includes(filters.surgeonName.toLowerCase())
            );
        }
        
        if (filters.accountType) {
            filteredOperations = filteredOperations.filter(op => op.accountType === filters.accountType);
        }
        
        return filteredOperations;
    }

    async getOperationsByMonth(year, month) {
        return this.operations.filter(op => {
            const opDate = new Date(op.date);
            return opDate.getFullYear() === year && opDate.getMonth() + 1 === month;
        });
    }

    async updateOperation(id, updates) {
        const index = this.operations.findIndex(op => op.id === id);
        if (index !== -1) {
            this.operations[index] = { ...this.operations[index], ...updates };
            this.saveToLocalStorage();
            return this.operations[index];
        }
        return null;
    }

    async deleteOperation(id) {
        const index = this.operations.findIndex(op => op.id === id);
        if (index !== -1) {
            this.operations.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Image Management
    async uploadImage(file) {
        return new Promise((resolve, reject) => {
            if (!APP_CONFIG.allowedImageTypes.includes(file.type)) {
                reject(new Error('نوع الملف غير مدعوم'));
                return;
            }

            if (file.size > APP_CONFIG.maxImageSize) {
                reject(new Error('حجم الملف كبير جداً'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const image = {
                    id: Date.now().toString(),
                    name: file.name,
                    url: e.target.result,
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString()
                };
                
                this.images.push(image);
                this.saveToLocalStorage();
                resolve(image);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async getImages() {
        return this.images;
    }

    async deleteImage(id) {
        const index = this.images.findIndex(img => img.id === id);
        if (index !== -1) {
            this.images.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Analytics
    getMonthlyStats(year, month) {
        const monthOperations = this.getOperationsByMonth(year, month);
        
        const stats = {
            totalOperations: monthOperations.length,
            totalCases: monthOperations.reduce((sum, op) => sum + parseInt(op.caseCount || 0), 0),
            byOperationType: {},
            byAccountType: {},
            bySurgeon: {}
        };

        monthOperations.forEach(op => {
            // By operation type
            stats.byOperationType[op.operationType] = (stats.byOperationType[op.operationType] || 0) + parseInt(op.caseCount || 0);
            
            // By account type
            stats.byAccountType[op.accountType] = (stats.byAccountType[op.accountType] || 0) + parseInt(op.caseCount || 0);
            
            // By surgeon
            stats.bySurgeon[op.surgeonName] = (stats.bySurgeon[op.surgeonName] || 0) + parseInt(op.caseCount || 0);
        });

        return stats;
    }

    // Export data
    exportToCSV(data, filename) {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    // Search functionality
    searchOperations(query) {
        if (!query) return this.operations;
        
        const searchTerm = query.toLowerCase();
        return this.operations.filter(op => 
            op.operationType.toLowerCase().includes(searchTerm) ||
            op.surgeonName.toLowerCase().includes(searchTerm) ||
            op.anesthesiologistName.toLowerCase().includes(searchTerm) ||
            op.notes.toLowerCase().includes(searchTerm) ||
            op.accountType.toLowerCase().includes(searchTerm)
        );
    }
}

// Initialize database manager
window.databaseManager = new DatabaseManager();