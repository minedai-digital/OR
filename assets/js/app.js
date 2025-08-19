// Main Application Controller
class AppController {
    constructor() {
        this.currentPage = 'index';
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeModules();
    }

    bindEvents() {
        // Data Entry Form
        const operationForm = document.getElementById('operationForm');
        if (operationForm) {
            operationForm.addEventListener('submit', (e) => this.handleOperationSubmit(e));
        }

        // Date filter for daily data
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.value = new Date().toISOString().split('T')[0];
            dateFilter.addEventListener('change', () => this.loadDailyData());
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Analysis filters
        const monthSelect = document.getElementById('monthSelect');
        const yearSelect = document.getElementById('yearSelect');
        
        if (monthSelect) {
            monthSelect.value = new Date().getMonth() + 1;
            monthSelect.addEventListener('change', () => this.loadAnalysisData());
        }
        
        if (yearSelect) {
            yearSelect.value = new Date().getFullYear();
            yearSelect.addEventListener('change', () => this.loadAnalysisData());
        }
    }

    initializeModules() {
        // Initialize page-specific modules
        window.dataManager = new DataManager();
        window.analysisManager = new AnalysisManager();
        window.dailyManager = new DailyManager();
        window.galleryManager = new GalleryManager();
    }

    async handleOperationSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const operationData = {
            time: formData.get('time'),
            operationType: formData.get('operationType'),
            accountType: formData.get('accountType'),
            surgeonName: formData.get('surgeonName'),
            anesthesiologistName: formData.get('anesthesiologistName'),
            theaterNo: formData.get('theaterNo'),
            caseCount: formData.get('caseCount'),
            notes: formData.get('notes')
        };

        try {
            await window.databaseManager.addOperation(operationData);
            this.showSuccessMessage('تم حفظ البيانات بنجاح');
            e.target.reset();
        } catch (error) {
            this.showErrorMessage('حدث خطأ أثناء حفظ البيانات');
            console.error('Error saving operation:', error);
        }
    }

    async loadDailyData() {
        const dateFilter = document.getElementById('dateFilter');
        const dailyTableBody = document.getElementById('dailyTableBody');
        
        if (!dateFilter || !dailyTableBody) return;

        const date = dateFilter.value;
        const operations = await window.databaseManager.getOperations({ date });

        this.renderDailyTable(operations, dailyTableBody);
    }

    async loadAnalysisData() {
        const monthSelect = document.getElementById('monthSelect');
        const yearSelect = document.getElementById('yearSelect');
        
        if (!monthSelect || !yearSelect) return;

        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);
        
        const stats = window.databaseManager.getMonthlyStats(year, month);
        this.renderAnalysisCharts(stats);
        this.renderAnalysisTable(stats);
    }

    renderDailyTable(operations, container) {
        container.innerHTML = '';
        
        if (operations.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                        <i class="fas fa-inbox text-4xl mb-2"></i>
                        <p>لا توجد عمليات لهذا اليوم</p>
                    </td>
                </tr>
            `;
            return;
        }

        operations.forEach(operation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${operation.time}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${operation.operationType}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="badge ${this.getAccountTypeBadgeClass(operation.accountType)}">
                        ${operation.accountType}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${operation.surgeonName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${operation.anesthesiologistName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${operation.theaterNo}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${operation.caseCount}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${operation.notes || '-'}</td>
            `;
            container.appendChild(row);
        });
    }

    renderAnalysisCharts(stats) {
        this.renderOperationChart(stats.byOperationType);
        this.renderAccountChart(stats.byAccountType);
    }

    renderOperationChart(data) {
        const ctx = document.getElementById('operationChart');
        if (!ctx) return;

        if (window.operationChart) {
            window.operationChart.destroy();
        }

        window.operationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'عدد الحالات',
                    data: Object.values(data),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'عدد الحالات حسب نوع العملية'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderAccountChart(data) {
        const ctx = document.getElementById('accountChart');
        if (!ctx) return;

        if (window.accountChart) {
            window.accountChart.destroy();
        }

        window.accountChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(245, 158, 11, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'توزيع أنواع الحسابات'
                    }
                }
            }
        });
    }

    renderAnalysisTable(stats) {
        const tbody = document.getElementById('analysisTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        Object.entries(stats.byOperationType).forEach(([operationType, count]) => {
            const row = document.createElement('tr');
            const insuranceCount = this.getCountByTypeAndAccount(operationType, 'تأمين', stats);
            const contractCount = this.getCountByTypeAndAccount(operationType, 'تعاقد', stats);
            const privateCount = this.getCountByTypeAndAccount(operationType, 'خاصة', stats);
            const total = insuranceCount + contractCount + privateCount;
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${operationType}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${count}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${insuranceCount}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${contractCount}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${privateCount}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${total}</td>
            `;
            tbody.appendChild(row);
        });
    }

    getCountByTypeAndAccount(operationType, accountType, stats) {
        // This is a simplified version - in real implementation, you'd need to store this data
        return Math.floor(Math.random() * 10); // Placeholder
    }

    getAccountTypeBadgeClass(accountType) {
        switch(accountType) {
            case 'تأمين': return 'badge-blue';
            case 'تعاقد': return 'badge-green';
            case 'خاصة': return 'badge-yellow';
            default: return 'badge-gray';
        }
    }

    handleSearch(e) {
        const query = e.target.value;
        const operations = window.databaseManager.searchOperations(query);
        const dailyTableBody = document.getElementById('dailyTableBody');
        
        if (dailyTableBody) {
            this.renderDailyTable(operations, dailyTableBody);
        }
    }

    changeDate(direction) {
        const dateFilter = document.getElementById('dateFilter');
        if (!dateFilter) return;

        const currentDate = new Date(dateFilter.value);
        currentDate.setDate(currentDate.getDate() + direction);
        dateFilter.value = currentDate.toISOString().split('T')[0];
        this.loadDailyData();
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `fixed top-4 right-4 p-4 rounded-md z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        alertDiv.textContent = message;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// Page-specific managers
class DataManager {
    initDataEntry() {
        // Initialize data entry page
        console.log('Data entry page initialized');
    }
}

class AnalysisManager {
    async initAnalysis() {
        window.appController.loadAnalysisData();
    }
}

class DailyManager {
    async initDaily() {
        window.appController.loadDailyData();
    }
}

class GalleryManager {
    async initGallery() {
        this.loadGallery();
    }

    async loadGallery() {
        const images = await window.databaseManager.getImages();
        const galleryGrid = document.getElementById('galleryGrid');
        
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';
        
        if (images.length === 0) {
            galleryGrid.innerHTML = `
                <div class="col-span-full empty-state">
                    <i class="fas fa-images"></i>
                    <p>لا توجد صور في المعرض</p>
                </div>
            `;
            return;
        }

        images.forEach(image => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `
                <img src="${image.url}" alt="${image.name}" onclick="window.galleryManager.openLightbox('${image.url}')">
                <div class="gallery-overlay">
                    <button onclick="window.galleryManager.deleteImage('${image.id}')" class="text-white">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            galleryGrid.appendChild(div);
        });
    }

    openLightbox(imageUrl) {
        const lightboxModal = document.getElementById('lightboxModal');
        const lightboxImage = document.getElementById('lightboxImage');
        
        if (lightboxModal && lightboxImage) {
            lightboxImage.src = imageUrl;
            lightboxModal.classList.remove('hidden');
        }
    }

    async deleteImage(imageId) {
        if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
            await window.databaseManager.deleteImage(imageId);
            this.loadGallery();
        }
    }
}

// Global functions for modals
function openUploadModal() {
    document.getElementById('uploadModal').classList.remove('hidden');
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.add('hidden');
    document.getElementById('imageUpload').value = '';
}

function closeLightbox() {
    document.getElementById('lightboxModal').classList.add('hidden');
}

async function uploadImages() {
    const fileInput = document.getElementById('imageUpload');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('الرجاء اختيار صور للرفع');
        return;
    }

    try {
        for (let file of files) {
            await window.databaseManager.uploadImage(file);
        }
        
        closeUploadModal();
        window.galleryManager.loadGallery();
        window.appController.showSuccessMessage('تم رفع الصور بنجاح');
    } catch (error) {
        window.appController.showErrorMessage('حدث خطأ أثناء رفع الصور');
        console.error('Upload error:', error);
    }
}

// Initialize application
window.appController = new AppController();

// Sort table functionality
function sortTable(column) {
    // Implementation for table sorting
    console.log('Sorting by:', column);
}

// Export functions
function exportToExcel() {
    const operations = window.databaseManager.operations;
    window.databaseManager.exportToCSV(operations, `operations_${new Date().toISOString().split('T')[0]}.csv`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Hospital Operations Management System initialized');
});
