// script_part1_setup.js

// --- Global Variables and Configuration ---
const DB_NAME = 'SalaryManagementDB';
const DB_VERSION = 10; // ⭐ تم زيادة إصدار قاعدة البيانات بسبب إضافة مخزن الإجازات
const STORE_CATEGORIES = 'categories';
const STORE_EMPLOYEES = 'employees';
const STORE_SALARIES = 'salaries';
const STORE_VIOLATIONS = 'violations';
const STORE_ADVANCES = 'advances';
const STORE_VACATIONS = 'vacations'; // ⭐ مخزن جديد للإجازات

let db; // IndexedDB database instance - سيتم تهيئته في script_part2
let categories = [];
let employees = [];
let salaries = [];
let violations = [];
let advances = [];
let vacations = []; // ⭐ مصفوفة جديدة لتخزين الإجازات

let currentEditCategoryId = null;
let currentEditEmployeeId = null;
let currentEditSalaryId = null;
let currentEditViolationId = null;
let currentEditAdvanceId = null;
let currentEditVacationId = null; // ⭐ متغير لتتبع الإجازة قيد التعديل

const ARABIC_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

// Object to store sort state for each table
const tableSortStates = {
    categoriesTable: { column: null, direction: 'asc' },
    employeesTable: { column: null, direction: 'asc' },
    salariesTable: { column: null, direction: 'asc' },
    violationsTable: { column: null, direction: 'asc' },
    residencyExpiryTable: { column: null, direction: 'asc' },
    advancesTable: { column: null, direction: 'asc' },
    carAssignmentsTable: { column: null, direction: 'asc' },
    vacationsTable: { column: null, direction: 'asc' } // ⭐ حالة الفرز لجدول الإجازات
};

// --- DOM Elements (Grouped for better organization and easier access) ---
const DomElements = {
    // Tabs
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Dashboard
    totalEmployeesCount: document.getElementById('totalEmployeesCount'),
    totalMonthlySalaries: document.getElementById('totalMonthlySalaries'),
    expiringResidenciesCount: document.getElementById('expiringResidenciesCount'),
    totalOutstandingAdvances: document.getElementById('totalOutstandingAdvances'),
    unpaidViolationsCount: document.getElementById('unpaidViolationsCount'),
    employeesOnVacationCount: document.getElementById('employeesOnVacationCount'), // ⭐ بطاقة الموظفين المجازين
    dashboardNotificationBadge: document.getElementById('dashboardNotificationBadge'), // ⭐ مؤشر الإشعارات على لوحة التحكم
    dashboardYearSelect: document.getElementById('dashboardYearSelect'),
    annualSalarySummary: document.getElementById('annualSalarySummary'),

    // Categories
    categoryForm: document.getElementById('categoryForm'),
    categoryIdInput: document.getElementById('categoryId'),
    categoryNameInput: document.getElementById('categoryName'),
    saveCategoryButton: document.getElementById('saveCategoryButton'),
    clearCategoryFormButton: document.getElementById('clearCategoryFormButton'),
    categoriesTableBody: document.getElementById('categoriesTable')?.getElementsByTagName('tbody')[0],
    categoriesTableSearch: document.getElementById('categoriesTableSearch'),

    // Employees
    employeeForm: document.getElementById('employeeForm'),
    employeeIdInput: document.getElementById('employeeId'),
    employeeNameInput: document.getElementById('employeeName'),
    employeeCategorySelect: document.getElementById('employeeCategory'),
    employeeDateOfBirthInput: document.getElementById('employeeDateOfBirth'),
    employeeIdNumberInput: document.getElementById('employeeIdNumber'),
    employeeIdExpiryDateInput: document.getElementById('employeeIdExpiryDate'),
    employeeIdIssuanceNumberInput: document.getElementById('employeeIdIssuanceNumber'),
    employeeCompanyNameInput: document.getElementById('employeeCompanyName'),
    employeeCompanyIdInput: document.getElementById('employeeCompanyId'),
    employeeCarNumberInput: document.getElementById('employeeCarNumber'),
    employeeNotesInput: document.getElementById('employeeNotes'),
    saveEmployeeButton: document.getElementById('saveEmployeeButton'),
    clearEmployeeFormButton: document.getElementById('clearEmployeeFormButton'),
    employeesTableBody: document.getElementById('employeesTable')?.getElementsByTagName('tbody')[0],
    employeesTableSearch: document.getElementById('employeesTableSearch'),

    // Employee Table Column Filters
    filterEmployeeName: document.getElementById('filterEmployeeName'),
    filterEmployeeCategory: document.getElementById('filterEmployeeCategory'),
    filterEmployeeIdNumber: document.getElementById('filterEmployeeIdNumber'),
    filterEmployeeCompanyName: document.getElementById('filterEmployeeCompanyName'),
    filterEmployeeCarNumber: document.getElementById('filterEmployeeCarNumber'),

    // Salaries
    salaryForm: document.getElementById('salaryForm'),
    salaryIdInput: document.getElementById('salaryId'),
    salaryEmployeeSelect: document.getElementById('salaryEmployee'),
    salaryBasicInput: document.getElementById('salaryBasic'),
    salaryAllowancesInput: document.getElementById('salaryAllowances'),
    salaryDeductionsInput: document.getElementById('salaryDeductions'),
    salaryDateInput: document.getElementById('salaryDate'),
    salaryPaymentMethodSelect: document.getElementById('salaryPaymentMethod'),
    salaryPayrollPeriodInput: document.getElementById('salaryPayrollPeriod'),
    saveSalaryButton: document.getElementById('saveSalaryButton'),
    clearSalaryFormButton: document.getElementById('clearSalaryFormButton'),
    copyPreviousMonthSalaryButton: document.getElementById('copyPreviousMonthSalaryButton'),
    autoPopulateSalariesButton: document.getElementById('autoPopulateSalariesButton'),
    salariesTableBody: document.getElementById('salariesTable')?.getElementsByTagName('tbody')[0],
    salariesTableSearch: document.getElementById('salariesTableSearch'),
    salaryVacationInfo: document.getElementById('salaryVacationInfo'), // ⭐ قسم تنبيه الإجازة في نموذج الراتب
    vacationAlertMessage: document.getElementById('vacationAlertMessage'), // ⭐ رسالة تنبيه الإجازة في نموذج الراتب

    // Vacations ⭐ عناصر قسم إدارة الإجازات
    vacationForm: document.getElementById('vacationForm'),
    vacationIdInput: document.getElementById('vacationId'),
    vacationEmployeeSelect: document.getElementById('vacationEmployee'),
    vacationTypeSelect: document.getElementById('vacationType'),
    vacationStartDateInput: document.getElementById('vacationStartDate'),
    vacationEndDateInput: document.getElementById('vacationEndDate'),
    vacationNotesInput: document.getElementById('vacationNotes'),
    saveVacationButton: document.getElementById('saveVacationButton'),
    clearVacationFormButton: document.getElementById('clearVacationFormButton'),
    vacationsTableBody: document.getElementById('vacationsTable')?.getElementsByTagName('tbody')[0],
    vacationsTableSearch: document.getElementById('vacationsTableSearch'),

    // Reports
    reportYearSelect: document.getElementById('reportYearSelect'),
    reportMonthSelect: document.getElementById('reportMonthSelect'),
    generateStandardReportButton: document.getElementById('generateStandardReportButton'),

    customReportTypeSelect: document.getElementById('customReportTypeSelect'),
    customReportEmployeeSelect: document.getElementById('customReportEmployeeSelect'),
    customReportCategorySelect: document.getElementById('customReportCategorySelect'),
    customReportAdvanceStatusSelect: document.getElementById('customReportAdvanceStatusSelect'),
    customReportVacationStatusDiv: document.getElementById('customReportVacationStatusDiv'), // ⭐ حاوية فلتر حالة الإجازة
    customReportVacationStatusSelect: document.getElementById('customReportVacationStatusSelect'), // ⭐ فلتر حالة الإجازة
    customReportYearSelect: document.getElementById('customReportYearSelect'),
    customReportMonthSelect: document.getElementById('customReportMonthSelect'),
    customReportStartDateInput: document.getElementById('customReportStartDate'),
    customReportEndDateInput: document.getElementById('customReportEndDate'),
    generateCustomReportButton: document.getElementById('generateCustomReportButton'),

    reportOutput: document.getElementById('reportOutput'),

    // Export Buttons
    exportButtonsContainer: document.getElementById('exportButtonsContainer'),
    exportExcelButton: document.getElementById('exportExcelButton'),
    exportPdfButton: document.getElementById('exportPdfButton'),

    // Backup/Restore
    backupDataButton: document.getElementById('backupDataButton'),
    restoreDataButton: document.getElementById('restoreDataButton'),
    restoreFileInput: document.getElementById('restoreFileInput'),

    // Violations
    violationForm: document.getElementById('violationForm'),
    violationIdInput: document.getElementById('violationId'),
    violationNumberInput: document.getElementById('violationNumber'),
    violationDateInput: document.getElementById('violationDate'),
    violationEmployeeSelect: document.getElementById('violationEmployee'),
    plateNumberInput: document.getElementById('plateNumber'),
    cityInput: document.getElementById('city'),
    violationAmountInput: document.getElementById('violationAmount'),
    violationDetailsInput: document.getElementById('violationDetails'),
    violationStatusSelect: document.getElementById('violationStatus'),
    violationNotesInput: document.getElementById('violationNotes'),
    saveViolationButton: document.getElementById('saveViolationButton'),
    clearViolationFormButton: document.getElementById('clearViolationFormButton'),
    violationsTableBody: document.getElementById('violationsTable')?.getElementsByTagName('tbody')[0],
    violationsTableSearch: document.getElementById('violationsTableSearch'),

    // Residency Expiry
    residencyExpiryTableBody: document.getElementById('residencyExpiryTable')?.getElementsByTagName('tbody')[0],
    residencyExpiryTableSearch: document.getElementById('residencyExpiryTableSearch'),

    // Advances
    advanceForm: document.getElementById('advanceForm'),
    advanceIdInput: document.getElementById('advanceId'),
    advanceEmployeeSelect: document.getElementById('advanceEmployee'),
    advanceDateInput: document.getElementById('advanceDate'),
    advanceAmountInput: document.getElementById('advanceAmount'),
    advanceReasonInput: document.getElementById('advanceReason'),
    advanceNotesInput: document.getElementById('advanceNotes'),
    saveAdvanceButton: document.getElementById('saveAdvanceButton'),
    clearAdvanceFormButton: document.getElementById('clearAdvanceFormButton'),
    advancesTableBody: document.getElementById('advancesTable')?.getElementsByTagName('tbody')[0],
    advancesTableSearch: document.getElementById('advancesTableSearch'),

    // Car Assignments
    carAssignmentsTableBody: document.getElementById('carAssignmentsTable')?.getElementsByTagName('tbody')[0],
    carAssignmentsTableSearch: document.getElementById('carAssignmentsTableSearch'),

    // Modals
    confirmationModal: document.getElementById('confirmationModal'),
    modalMessage: document.getElementById('modalMessage'),
    confirmActionButton: document.getElementById('confirmActionButton'),

    partialPaymentModal: document.getElementById('partialPaymentModal'),
    partialPaymentForm: document.getElementById('partialPaymentForm'),
    partialPaymentAdvanceIdInput: document.getElementById('partialPaymentAdvanceId'),
    partialPaymentEmployeeNameSpan: document.getElementById('partialPaymentEmployeeName'),
    partialPaymentTotalAmountSpan: document.getElementById('partialPaymentTotalAmount'),
    partialPaymentAlreadyPaidSpan: document.getElementById('partialPaymentAlreadyPaid'),
    partialPaymentRemainingAmountSpan: document.getElementById('partialPaymentRemainingAmount'),
    partialPaymentAmountToPayInput: document.getElementById('partialPaymentAmountToPay'),

    // Toast Notification
    toastNotification: document.getElementById('toastNotification'),
    toastMessage: document.getElementById('toastMessage')
};

let confirmCallback = null; // Used for confirmation modal callback

// --- Utility Functions for Modals ---
function showModal(modalId, message, callback) {
    const modalElement = DomElements[modalId]; // Access directly from DomElements
    if (!modalElement) {
        console.error(`Modal element with ID '${modalId}' not found.`);
        return;
    }

    if (modalId === 'confirmationModal') {
        if(DomElements.modalMessage) DomElements.modalMessage.innerHTML = message;
        confirmCallback = callback;
        if(DomElements.confirmActionButton) DomElements.confirmActionButton.style.display = callback ? "inline-block" : "none"; // Hide if no callback
        const cancelButton = modalElement.querySelector('.btn-secondary');
        if(cancelButton) cancelButton.textContent = callback ? "إلغاء" : "إغلاق";
    }
    modalElement.style.display = "block";
}

function closeModal(modalId) {
    const modalElement = DomElements[modalId]; // Access directly from DomElements
    if (!modalElement) {
        console.error(`Modal element with ID '${modalId}' not found.`);
        return;
    }

    modalElement.style.display = "none";
    if (modalId === 'confirmationModal') {
        confirmCallback = null;
    } else if (modalId === 'partialPaymentModal') {
        if(DomElements.partialPaymentForm) DomElements.partialPaymentForm.reset();
    }
}


// --- Toast Notification Function ---
/**
 * تعرض رسالة إشعار مؤقتة (toast).
 * @param {string} message - الرسالة المراد عرضها.
 * @param {'info'|'success'|'error'} type - نوع الإشعار (يؤثر على لون الخلفية).
 * @param {number} duration - مدة عرض الإشعار بالمللي ثانية.
 */
function showToast(message, type = 'info', duration = 3000) {
    const toastNotification = DomElements.toastNotification;
    const toastMessage = DomElements.toastMessage;

    if (!toastNotification || !toastMessage) {
        console.warn("Toast elements not found in HTML. Notification not shown. Falling back to alert.");
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }

    toastMessage.textContent = message;
    toastNotification.className = 'fixed bottom-5 right-5 p-4 rounded-md shadow-lg text-white z-[2000]';
    toastNotification.classList.add(type);
    toastNotification.classList.remove('hidden');

    setTimeout(() => {
        toastNotification.classList.add('hidden');
    }, duration);
}

// --- Tab Management ---
// الدوال المستدعاة داخل openTab (مثل populateReportYears) يفترض أنها معرفة
// في الملفات التي سيتم تحميلها لاحقًا (part3 أو reports.js)
function openTab(tabName) { // Removed 'event' parameter as it's no longer passed from HTML
    DomElements.tabContents.forEach(content => {
        if (content.id === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    DomElements.tabButtons.forEach(button => {
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Dynamic content loading/rendering based on tab
    if (tabName === 'reports-management') {
        if(typeof populateReportYears === 'function' && DomElements.reportYearSelect) populateReportYears(DomElements.reportYearSelect);
        if(typeof populateReportYears === 'function' && DomElements.customReportYearSelect) populateReportYears(DomElements.customReportYearSelect);
        if(typeof populateEmployeeSelects === 'function' && DomElements.customReportEmployeeSelect) populateEmployeeSelects(DomElements.customReportEmployeeSelect, "جميع الموظفين");
        if(typeof populateCategorySelects === 'function' && DomElements.customReportCategorySelect) populateCategorySelects(DomElements.customReportCategorySelect, "جميع الفئات");
        if(DomElements.exportButtonsContainer) DomElements.exportButtonsContainer.style.display = "none";
        if(DomElements.reportOutput) DomElements.reportOutput.innerHTML = `<p class="text-gray-500">سيتم عرض بيانات التقرير هنا...</p>`;
        if(DomElements.customReportStartDateInput) DomElements.customReportStartDateInput.value = '';
        if(DomElements.customReportEndDateInput) DomElements.customReportEndDateInput.value = '';
        // Check for populateReportMonths function before calling
        if(typeof populateReportMonths === 'function' && DomElements.reportYearSelect && DomElements.reportYearSelect.value && DomElements.reportMonthSelect) {
            populateReportMonths(DomElements.reportMonthSelect, DomElements.reportYearSelect.value);
        }
        if(typeof populateReportMonths === 'function' && DomElements.customReportYearSelect && DomElements.customReportYearSelect.value && DomElements.customReportMonthSelect) {
            populateReportMonths(DomElements.customReportMonthSelect, DomElements.customReportYearSelect.value);
        }
        // ⭐ إظهار/إخفاء فلتر حالة الإجازة بناءً على نوع التقرير المختار
        if (DomElements.customReportTypeSelect && DomElements.customReportVacationStatusDiv) {
            DomElements.customReportVacationStatusDiv.style.display = DomElements.customReportTypeSelect.value === 'vacationReport' ? 'block' : 'none';
        }

    } else if (tabName === 'violations-management') {
        if(typeof populateEmployeeSelects === 'function' && DomElements.violationEmployeeSelect) populateEmployeeSelects(DomElements.violationEmployeeSelect, "اختر موظف للمخالفة...");
        if(typeof clearViolationForm === 'function') clearViolationForm();
    } else if (tabName === 'residency-expiry-management') {
        if(typeof renderResidencyExpiryTable === 'function') renderResidencyExpiryTable();
    } else if (tabName === 'advances-management') {
        if(typeof populateEmployeeSelects === 'function' && DomElements.advanceEmployeeSelect) populateEmployeeSelects(DomElements.advanceEmployeeSelect, "اختر موظف للسلفة...");
        if(typeof clearAdvanceForm === 'function') clearAdvanceForm();
    } else if (tabName === 'salary-management') {
        const today = new Date();
        if(DomElements.salaryDateInput) DomElements.salaryDateInput.value = today.toISOString().slice(0, 10);
        if (typeof populateEmployeeSelects === 'function' && DomElements.salaryEmployeeSelect && DomElements.salaryEmployeeSelect.options.length <= 1 && employees.length > 0) {
            populateEmployeeSelects(DomElements.salaryEmployeeSelect, "اختر موظف...");
        }
         if (DomElements.salaryVacationInfo) DomElements.salaryVacationInfo.style.display = 'none'; // إخفاء تنبيه الإجازة عند فتح التاب
    } else if (tabName === 'dashboard') {
        if(typeof renderDashboard === 'function') renderDashboard();
    } else if (tabName === 'car-assignments') {
        if(typeof renderCarAssignmentsTable === 'function') renderCarAssignmentsTable();
    } else if (tabName === 'employee-management') {
        if(typeof populateEmployeeCategoryFilter === 'function') populateEmployeeCategoryFilter();
        // Pass the current search value if exists, otherwise empty string
        if(typeof renderEmployeesTable === 'function') renderEmployeesTable(DomElements.employeesTableSearch ? DomElements.employeesTableSearch.value : '');
    } else if (tabName === 'vacation-management') { // ⭐ منطق فتح لسان إدارة الإجازات
        if(typeof populateEmployeeSelects === 'function' && DomElements.vacationEmployeeSelect) {
            // false كمعامل ثالث لمنع إضافة خيار "جميع الموظفين" هنا
            populateEmployeeSelects(DomElements.vacationEmployeeSelect, "اختر موظف للإجازة...", false);
        }
        if(typeof clearVacationForm === 'function') clearVacationForm();
        if(typeof renderVacationsTable === 'function') renderVacationsTable(); // عرض جدول الإجازات عند فتح اللسان
    }

    // ⭐ تحديث إظهار/إخفاء فلتر حالة الإجازة عند تغيير نوع التقرير في أي وقت (وليس فقط عند فتح التاب)
    if (DomElements.customReportTypeSelect) {
        DomElements.customReportTypeSelect.addEventListener('change', () => {
            if (DomElements.customReportVacationStatusDiv) {
                DomElements.customReportVacationStatusDiv.style.display = DomElements.customReportTypeSelect.value === 'vacationReport' ? 'block' : 'none';
            }
        });
        // للتأكد من الحالة الصحيحة عند تحميل الصفحة لأول مرة إذا كان تقرير الإجازات هو الافتراضي
        if (DomElements.customReportVacationStatusDiv && DomElements.customReportTypeSelect.value === 'vacationReport') {
             DomElements.customReportVacationStatusDiv.style.display = 'block';
        } else if (DomElements.customReportVacationStatusDiv) {
             DomElements.customReportVacationStatusDiv.style.display = 'none';
        }
    }
}