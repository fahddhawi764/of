// script_part3_ui_events_load.js

// Global array to store active alerts
let activeAlerts = [];

// --- ⭐ تعريفات دوال clear...Form أولاً ---
// تم نقل هذه الدوال هنا لضمان توفرها قبل استخدامها
function clearCategoryForm() {
    if (DomElements.categoryForm) DomElements.categoryForm.reset();
    if (DomElements.categoryIdInput) DomElements.categoryIdInput.value = "";
    currentEditCategoryId = null;
    if (DomElements.saveCategoryButton) DomElements.saveCategoryButton.textContent = "إضافة قسم";
    if (DomElements.categoryNameInput) DomElements.categoryNameInput.focus();
}

function clearEmployeeForm() {
    if (DomElements.employeeForm) DomElements.employeeForm.reset();
    if (DomElements.employeeIdInput) DomElements.employeeIdInput.value = "";
    currentEditEmployeeId = null;
    if (DomElements.saveEmployeeButton) DomElements.saveEmployeeButton.textContent = "إضافة موظف";
    if (DomElements.employeeNameInput) DomElements.employeeNameInput.focus();
    if (DomElements.employeeDateOfBirthInput) DomElements.employeeDateOfBirthInput.value = "";
    if (DomElements.employeeIdNumberInput) DomElements.employeeIdNumberInput.value = "";
    if (DomElements.employeeIdExpiryDateInput) DomElements.employeeIdExpiryDateInput.value = "";
    if (DomElements.employeeIdIssuanceNumberInput) DomElements.employeeIdIssuanceNumberInput.value = "";
    if (DomElements.employeeCompanyNameInput) DomElements.employeeCompanyNameInput.value = "";
    if (DomElements.employeeCompanyIdInput) DomElements.employeeCompanyIdInput.value = "";
    if (DomElements.employeeCarNumberInput) DomElements.employeeCarNumberInput.value = "";
    if (DomElements.employeeNotesInput) DomElements.employeeNotesInput.value = "";
}

function clearSalaryForm() {
    if (DomElements.salaryForm) DomElements.salaryForm.reset();
    if (DomElements.salaryIdInput) DomElements.salaryIdInput.value = "";
    const today = new Date();
    if (DomElements.salaryDateInput) DomElements.salaryDateInput.value = today.toISOString().slice(0, 10);
    if (DomElements.salaryPaymentMethodSelect) DomElements.salaryPaymentMethodSelect.value = 'تحويل';
    if (DomElements.salaryPayrollPeriodInput) DomElements.salaryPayrollPeriodInput.value = '';
    currentEditSalaryId = null;
    if (DomElements.saveSalaryButton) DomElements.saveSalaryButton.textContent = "إضافة راتب";
    if (DomElements.salaryEmployeeSelect) DomElements.salaryEmployeeSelect.focus();
    if (DomElements.salaryVacationInfo) DomElements.salaryVacationInfo.style.display = 'none';
}

function clearViolationForm() {
    if(DomElements.violationForm) DomElements.violationForm.reset();
    if(DomElements.violationIdInput) DomElements.violationIdInput.value = "";
    if(DomElements.violationNumberInput) DomElements.violationNumberInput.value = "";
    if(DomElements.violationDateInput) DomElements.violationDateInput.valueAsDate = new Date();
    if(DomElements.violationEmployeeSelect) DomElements.violationEmployeeSelect.value = "";
    if(DomElements.plateNumberInput) DomElements.plateNumberInput.value = "";
    if(DomElements.cityInput) DomElements.cityInput.value = "";
    if(DomElements.violationAmountInput) DomElements.violationAmountInput.value = "0";
    if(DomElements.violationDetailsInput) DomElements.violationDetailsInput.value = "";
    if(DomElements.violationStatusSelect) DomElements.violationStatusSelect.value = "غير مدفوعة";
    if(DomElements.violationNotesInput) DomElements.violationNotesInput.value = "";
    currentEditViolationId = null;
    if(DomElements.saveViolationButton) DomElements.saveViolationButton.textContent = "حفظ المخالفة";
    if(DomElements.clearViolationFormButton && DomElements.clearViolationFormButton.textContent.includes("التعديل")) DomElements.clearViolationFormButton.textContent = "إلغاء";
    if(DomElements.violationEmployeeSelect) DomElements.violationEmployeeSelect.focus();
}

function clearAdvanceForm() {
    if(DomElements.advanceForm) DomElements.advanceForm.reset();
    if(DomElements.advanceIdInput) DomElements.advanceIdInput.value = "";
    currentEditAdvanceId = null;
    if(DomElements.saveAdvanceButton) DomElements.saveAdvanceButton.textContent = "إضافة سلفة";
    if(DomElements.advanceEmployeeSelect) DomElements.advanceEmployeeSelect.focus();
    if(DomElements.advanceDateInput) DomElements.advanceDateInput.valueAsDate = new Date();
    if(DomElements.advanceAmountInput) DomElements.advanceAmountInput.value = "0";
}

function clearVacationForm() {
    if(DomElements.vacationForm) DomElements.vacationForm.reset();
    if(DomElements.vacationIdInput) DomElements.vacationIdInput.value = "";
    currentEditVacationId = null;
    if(DomElements.saveVacationButton) DomElements.saveVacationButton.textContent = "حفظ الإجازة";
    if(DomElements.vacationEmployeeSelect) DomElements.vacationEmployeeSelect.value = "";
    if(DomElements.vacationTypeSelect) DomElements.vacationTypeSelect.value = "";
    if(DomElements.vacationStartDateInput) DomElements.vacationStartDateInput.value = "";
    if(DomElements.vacationEndDateInput) DomElements.vacationEndDateInput.value = "";
    if(DomElements.vacationNotesInput) DomElements.vacationNotesInput.value = "";
    if(DomElements.vacationEmployeeSelect) DomElements.vacationEmployeeSelect.focus();
}

// --- UI Rendering Functions ---

function renderCategoriesTable(filterText = '') {
    if (!DomElements.categoriesTableBody) return;
    DomElements.categoriesTableBody.innerHTML = "";
    let filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(filterText.toLowerCase())
    );

    if (tableSortStates.categoriesTable.column) {
        filtered = sortArray(filtered, tableSortStates.categoriesTable.column, tableSortStates.categoriesTable.direction);
    }

    if (filtered.length === 0) {
        DomElements.categoriesTableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center">لا توجد أقسام مطابقة.</td></tr>`;
        return;
    }

    filtered.forEach((category, index) => {
        const row = DomElements.categoriesTableBody.insertRow();
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${category.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${category.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-category-btn" data-id="${category.id}">تعديل</button>
                <button class="text-red-600 hover:text-red-900 delete-category-btn" data-id="${category.id}" data-name="${CSS.escape(category.name)}">حذف</button>
            </td>`;
    });
    updateSortIndicators('categoriesTable', tableSortStates.categoriesTable.column, tableSortStates.categoriesTable.direction);
}

function populateCategorySelects(selectElement, defaultOptionText, includeAllOption = true) {
    if (!selectElement) return;
    const currentVal = selectElement.value;
    selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
    if (selectElement.id === 'customReportCategorySelect') {
        const allCategoriesOption = document.createElement('option');
        allCategoriesOption.value = "0";
        allCategoriesOption.textContent = "جميع الفئات";
        selectElement.appendChild(allCategoriesOption);
    }
    categories.sort((a, b) => a.name.localeCompare(b.name, 'ar')).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        selectElement.appendChild(option);
    });
    if (Array.from(selectElement.options).some(opt => opt.value === currentVal)) {
        selectElement.value = currentVal;
    }
}

function populateEmployeeCategoryFilter() {
    if (!DomElements.filterEmployeeCategory) return;
    const currentVal = DomElements.filterEmployeeCategory.value;
    DomElements.filterEmployeeCategory.innerHTML = '<option value="">الكل</option>';
    categories.sort((a, b) => a.name.localeCompare(b.name, 'ar')).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        DomElements.filterEmployeeCategory.appendChild(option);
    });
    if (Array.from(DomElements.filterEmployeeCategory.options).some(opt => opt.value === currentVal)) {
        DomElements.filterEmployeeCategory.value = currentVal;
    }
}

function renderEmployeesTable(globalFilterText = '') {
    if (!DomElements.employeesTableBody) return;
    DomElements.employeesTableBody.innerHTML = "";
    const nameFilterValue = DomElements.filterEmployeeName ? DomElements.filterEmployeeName.value.toLowerCase() : '';
    const categoryFilterValue = DomElements.filterEmployeeCategory ? DomElements.filterEmployeeCategory.value : '';
    const idNumberFilterValue = DomElements.filterEmployeeIdNumber ? DomElements.filterEmployeeIdNumber.value.toLowerCase() : '';
    const companyNameFilterValue = DomElements.filterEmployeeCompanyName ? DomElements.filterEmployeeCompanyName.value.toLowerCase() : '';
    const carNumberFilterValue = DomElements.filterEmployeeCarNumber ? DomElements.filterEmployeeCarNumber.value.toLowerCase() : '';
    const globalSearchValue = DomElements.employeesTableSearch ? DomElements.employeesTableSearch.value.toLowerCase() : globalFilterText.toLowerCase();

    let filteredEmployees = employees.filter(emp => {
        let matchesGlobal = true;
        if (globalSearchValue) {
            matchesGlobal = (
                (emp.name || '').toLowerCase().includes(globalSearchValue) ||
                (emp.categoryName || '').toLowerCase().includes(globalSearchValue) ||
                (emp.idNumber || '').toLowerCase().includes(globalSearchValue) ||
                (emp.idIssuanceNumber || '').toLowerCase().includes(globalSearchValue) ||
                (emp.companyName || '').toLowerCase().includes(globalSearchValue) ||
                (emp.carNumber || '').toLowerCase().includes(globalSearchValue) ||
                (emp.notes || '').toLowerCase().includes(globalSearchValue)
            );
        }
        const matchesName = !nameFilterValue || (emp.name || '').toLowerCase().includes(nameFilterValue);
        const matchesCategory = !categoryFilterValue || emp.categoryId === parseInt(categoryFilterValue);
        const matchesIdNumber = !idNumberFilterValue || (emp.idNumber || '').toLowerCase().includes(idNumberFilterValue);
        const matchesCompanyName = !companyNameFilterValue || (emp.companyName || '').toLowerCase().includes(companyNameFilterValue);
        const matchesCarNumber = !carNumberFilterValue || (emp.carNumber || '').toLowerCase().includes(carNumberFilterValue);
        return matchesGlobal && matchesName && matchesCategory && matchesIdNumber && matchesCompanyName && matchesCarNumber;
    });

    if (tableSortStates.employeesTable.column) {
        if (tableSortStates.employeesTable.column === 'vacationStatus') {
            const todayForSort = new Date();
            todayForSort.setHours(0, 0, 0, 0);
            filteredEmployees = filteredEmployees.map(emp => {
                const tempEmp = { ...emp };
                const currentVacation = vacations.find(vac =>
                    vac.employeeId === tempEmp.id &&
                    new Date(vac.vacationStartDate) <= todayForSort &&
                    new Date(vac.vacationEndDate) >= todayForSort
                );
                tempEmp.isOnVacationSort = currentVacation ? 1 : 0;
                tempEmp.vacationEndDateSortValue = currentVacation ? new Date(currentVacation.vacationEndDate).getTime() : 0;
                return tempEmp;
            }).sort((a, b) => {
                if (tableSortStates.employeesTable.direction === 'asc') {
                    if (a.isOnVacationSort !== b.isOnVacationSort) {
                        return a.isOnVacationSort - b.isOnVacationSort;
                    }
                    return a.isOnVacationSort === 1 ? a.vacationEndDateSortValue - b.vacationEndDateSortValue : 0;
                } else {
                    if (a.isOnVacationSort !== b.isOnVacationSort) {
                        return b.isOnVacationSort - a.isOnVacationSort;
                    }
                    return a.isOnVacationSort === 1 ? b.vacationEndDateSortValue - a.vacationEndDateSortValue : 0;
                }
            });
        } else {
            filteredEmployees = sortArray(filteredEmployees, tableSortStates.employeesTable.column, tableSortStates.employeesTable.direction);
        }
    }


    if (filteredEmployees.length === 0) {
        DomElements.employeesTableBody.innerHTML = `<tr><td colspan="13" class="px-6 py-4 text-center">لا يوجد موظفون مطابقون لمعايير البحث/الفلترة.</td></tr>`;
        return;
    }
    const today = new Date();
    today.setHours(0,0,0,0);

    filteredEmployees.forEach((emp, index) => {
        const row = DomElements.employeesTableBody.insertRow();
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${emp.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${emp.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.categoryName || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.dateOfBirth || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.idNumber || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.idIssuanceNumber || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.idExpiryDate || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${emp.vacationStatusClass}">${emp.vacationStatusDisplay}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.companyName || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.companyId || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.carNumber || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.notes || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-employee-btn" data-id="${emp.id}">تعديل</button>
                <button class="text-red-600 hover:text-red-900 delete-employee-btn" data-id="${emp.id}" data-name="${CSS.escape(emp.name)}">حذف</button>
            </td>`;
    });
    updateSortIndicators('employeesTable', tableSortStates.employeesTable.column, tableSortStates.employeesTable.direction);
}


function populateEmployeeSelects(selectElement, defaultOptionText, includeAllOption = true) {
    if (!selectElement) return;
    const currentVal = selectElement.value;
    selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
    if (includeAllOption && (selectElement.id === 'customReportEmployeeSelect' || selectElement.id === 'violationEmployee' || selectElement.id === 'advanceEmployee' || selectElement.id === 'vacationEmployee')) {
        const allEmployeesOption = document.createElement('option');
        allEmployeesOption.value = "0";
        allEmployeesOption.textContent = "جميع الموظفين";
        selectElement.appendChild(allEmployeesOption);
    }
    employees.sort((a, b) => a.name.localeCompare(b.name, 'ar')).forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = emp.name;
        selectElement.appendChild(option);
    });
    if (Array.from(selectElement.options).some(opt => opt.value === currentVal)) {
        selectElement.value = currentVal;
    }
}

function renderSalariesTable(globalFilterText = '') {
    if (!DomElements.salariesTableBody) return;
    DomElements.salariesTableBody.innerHTML = "";

    // احصل على قيم الفلاتر الجديدة
    const employeeNameFilter = document.getElementById('filterSalaryEmployeeName')?.value.toLowerCase() || '';
    const dateFilter = document.getElementById('filterSalaryDate')?.value || ''; // تاريخ بالصيغةYYYY-MM-DD
    const paymentMethodFilter = document.getElementById('filterSalaryPaymentMethod')?.value || '';
    const payrollPeriodFilter = document.getElementById('filterSalaryPayrollPeriod')?.value.toLowerCase() || '';

    let filtered = salaries.filter(sal => {
        let matchesGlobal = true;
        if (globalFilterText) {
            matchesGlobal = (
                (sal.employeeName || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (sal.payrollPeriod || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (sal.date || '').includes(globalFilterText) ||
                (sal.paymentMethod || '').toLowerCase().includes(globalFilterText.toLowerCase())
            );
        }

        const matchesEmployeeName = !employeeNameFilter || (sal.employeeName || '').toLowerCase().includes(employeeNameFilter);
        const matchesDate = !dateFilter || (sal.date || '').includes(dateFilter);
        const matchesPaymentMethod = !paymentMethodFilter || sal.paymentMethod === paymentMethodFilter;
        const matchesPayrollPeriod = !payrollPeriodFilter || (sal.payrollPeriod || '').toLowerCase().includes(payrollPeriodFilter);

        return matchesGlobal && matchesEmployeeName && matchesDate && matchesPaymentMethod && matchesPayrollPeriod;
    });

    if (tableSortStates.salariesTable.column) {
        filtered = sortArray(filtered, tableSortStates.salariesTable.column, tableSortStates.salariesTable.direction);
    }
    if (filtered.length === 0) {
        DomElements.salariesTableBody.innerHTML = `<tr><td colspan="10" class="px-6 py-4 text-center">لا توجد سجلات رواتب مطابقة.</td></tr>`;
        return;
    }
    filtered.forEach((salary, index) => {
        const row = DomElements.salariesTableBody.insertRow();
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${salary.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${salary.employeeName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(salary.basic || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(salary.allowances || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(salary.deductions || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">${(salary.total || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${salary.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${salary.paymentMethod || 'غير محدد'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${salary.payrollPeriod || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-salary-btn" data-id="${salary.id}">تعديل</button>
                <button class="text-red-600 hover:text-red-900 delete-salary-btn" data-id="${salary.id}" data-empname="${CSS.escape(salary.employeeName || 'Unknown')}" data-date="${salary.date}">حذف</button>
            </td>`;
    });
    updateSortIndicators('salariesTable', tableSortStates.salariesTable.column, tableSortStates.salariesTable.direction);
}

function renderViolationsTable(globalFilterText = '') {
    if (!DomElements.violationsTableBody) return;
    DomElements.violationsTableBody.innerHTML = "";

    // احصل على قيم الفلاتر الجديدة
    const violationNumberFilter = document.getElementById('filterViolationNumber')?.value.toLowerCase() || '';
    const dateFilter = document.getElementById('filterViolationDate')?.value || '';
    const employeeNameFilter = document.getElementById('filterViolationEmployeeName')?.value.toLowerCase() || '';
    const plateNumberFilter = document.getElementById('filterViolationPlateNumber')?.value.toLowerCase() || '';
    const cityFilter = document.getElementById('filterViolationCity')?.value.toLowerCase() || '';
    const detailsFilter = document.getElementById('filterViolationDetails')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterViolationStatus')?.value || '';

    let filtered = violations.filter(vio => {
        let matchesGlobal = true;
        if (globalFilterText) {
            matchesGlobal = (
                (vio.employeeName || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (vio.violationNumber || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (vio.plateNumber || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (vio.city || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (vio.details || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (vio.status || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (vio.date || '').includes(globalFilterText)
            );
        }

        const matchesViolationNumber = !violationNumberFilter || (vio.violationNumber || '').toLowerCase().includes(violationNumberFilter);
        const matchesDate = !dateFilter || (vio.date || '').includes(dateFilter);
        const matchesEmployeeName = !employeeNameFilter || (vio.employeeName || '').toLowerCase().includes(employeeNameFilter);
        const matchesPlateNumber = !plateNumberFilter || (vio.plateNumber || '').toLowerCase().includes(plateNumberFilter);
        const matchesCity = !cityFilter || (vio.city || '').toLowerCase().includes(cityFilter);
        const matchesDetails = !detailsFilter || (vio.details || '').toLowerCase().includes(detailsFilter);
        const matchesStatus = !statusFilter || vio.status === statusFilter;

        return matchesGlobal && matchesViolationNumber && matchesDate && matchesEmployeeName && matchesPlateNumber && matchesCity && matchesDetails && matchesStatus;
    });

    if (tableSortStates.violationsTable.column) {
        filtered = sortArray(filtered, tableSortStates.violationsTable.column, tableSortStates.violationsTable.direction);
    }
    if (filtered.length === 0) {
        DomElements.violationsTableBody.innerHTML = `<tr><td colspan="11" class="px-6 py-4 text-center">لا توجد سجلات مخالفات مطابقة.</td></tr>`;
        return;
    }
    filtered.forEach((violation, index) => {
        const row = DomElements.violationsTableBody.insertRow();
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${violation.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${violation.violationNumber || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${violation.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${violation.employeeName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${violation.plateNumber || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${violation.city || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">${(violation.amount || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${violation.details || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${violation.status || 'غير محدد'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${violation.notes || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-violation-btn" data-id="${violation.id}">تعديل</button>
                <button class="text-red-600 hover:text-red-900 delete-violation-btn" data-id="${violation.id}" data-empname="${CSS.escape(violation.employeeName || 'Unknown')}" data-date="${violation.date}">حذف</button>
            </td>`;
    });
    updateSortIndicators('violationsTable', tableSortStates.violationsTable.column, tableSortStates.violationsTable.direction);
}

function renderResidencyExpiryTable(filterText = '') {
    if (!DomElements.residencyExpiryTableBody) return;
    DomElements.residencyExpiryTableBody.innerHTML = "";
    let filtered = employees.filter(emp =>
        (emp.name || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (emp.idNumber || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (emp.idExpiryDate || '').includes(filterText)
    );
    if (tableSortStates.residencyExpiryTable.column) {
        if (tableSortStates.residencyExpiryTable.column === 'remainingDuration') {
            filtered = filtered.map(emp => {
                const tempEmp = { ...emp };
                if (tempEmp.idExpiryDate) {
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const expiryDate = new Date(tempEmp.idExpiryDate); expiryDate.setHours(0, 0, 0, 0);
                    if (!isNaN(expiryDate.getTime())) {
                         tempEmp.remainingDuration = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    } else { tempEmp.remainingDuration = Infinity; }
                } else { tempEmp.remainingDuration = Infinity; }
                return tempEmp;
            });
        }
        filtered = sortArray(filtered, tableSortStates.residencyExpiryTable.column, tableSortStates.residencyExpiryTable.direction);
    }
    if (filtered.length === 0) {
        DomElements.residencyExpiryTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center">لا يوجد موظفون لعرض تواريخ الإقامة.</td></tr>`;
        return;
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    filtered.forEach((emp, index) => {
        const row = DomElements.residencyExpiryTableBody.insertRow();
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        let expiryDateStr = emp.idExpiryDate; let remainingDurationText = "غير متوفر"; let status = "غير محدد"; let statusClass = "text-gray-500";
        if (expiryDateStr) {
            const expiryDate = new Date(expiryDateStr); expiryDate.setHours(0, 0, 0, 0);
            if (isNaN(expiryDate.getTime())) { expiryDateStr = "تاريخ غير صالح"; status = "خطأ في التاريخ"; statusClass = "text-red-800";
            } else {
                const diffTime = expiryDate.getTime() - today.getTime(); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 0) { status = "منتهية"; statusClass = "text-red-600 font-bold"; remainingDurationText = "منتهية"; }
                else if (diffDays === 0) { status = "تنتهي اليوم"; statusClass = "text-orange-600 font-bold"; remainingDurationText = "تنتهي اليوم"; }
                else {
                    let years = 0, months = 0, days = 0; let tempDate = new Date(today.getTime()); tempDate.setHours(0,0,0,0);
                    while (new Date(tempDate.getFullYear() + 1, tempDate.getMonth(), tempDate.getDate()).getTime() <= expiryDate.getTime()) {
                        years++;
                        tempDate.setFullYear(tempDate.getFullYear() + 1);
                    }
                    while (new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, tempDate.getDate()).getTime() <= expiryDate.getTime()) {
                        months++;
                        tempDate.setMonth(tempDate.getMonth() + 1);
                    }
                    days = Math.ceil((expiryDate.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));

                    remainingDurationText = `${years} سنة, ${months} شهر, ${days} يوم`;
                    status = "صالح";
                    statusClass = "text-green-600";
                    if (diffDays <= 90) {
                        status = "قريب الانتهاء";
                        statusClass = "text-orange-600 font-semibold";
                    }
                }
            }
        } else { expiryDateStr = "غير متوفر"; status = "غير متوفر"; statusClass = "text-gray-500"; }
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${emp.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${emp.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${expiryDateStr}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${remainingDurationText}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${statusClass}">${status}</td>`;
    });
    updateSortIndicators('residencyExpiryTable', tableSortStates.residencyExpiryTable.column, tableSortStates.residencyExpiryTable.direction);
}

function renderAdvancesTable(globalFilterText = '') {
    if (!DomElements.advancesTableBody) return;
    DomElements.advancesTableBody.innerHTML = "";

    // احصل على قيم الفلاتر الجديدة
    const employeeNameFilter = document.getElementById('filterAdvanceEmployeeName')?.value.toLowerCase() || '';
    const dateFilter = document.getElementById('filterAdvanceDate')?.value || '';
    const reasonFilter = document.getElementById('filterAdvanceReason')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterAdvanceStatus')?.value || '';

    let filtered = advances.filter(adv => {
        let matchesGlobal = true;
        if (globalFilterText) {
            matchesGlobal = (
                (adv.employeeName || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (adv.reason || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (adv.status || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (adv.date || '').includes(globalFilterText)
            );
        }

        const matchesEmployeeName = !employeeNameFilter || (adv.employeeName || '').toLowerCase().includes(employeeNameFilter);
        const matchesDate = !dateFilter || (adv.date || '').includes(dateFilter);
        const matchesReason = !reasonFilter || (adv.reason || '').toLowerCase().includes(reasonFilter);
        const matchesStatus = !statusFilter || adv.status === statusFilter;

        return matchesGlobal && matchesEmployeeName && matchesDate && matchesReason && matchesStatus;
    });

    if (tableSortStates.advancesTable.column) {
        filtered = sortArray(filtered, tableSortStates.advancesTable.column, tableSortStates.advancesTable.direction);
    }
    if (filtered.length === 0) {
        DomElements.advancesTableBody.innerHTML = `<tr><td colspan="10" class="px-6 py-4 text-center">لا توجد سجلات سلف مطابقة.</td></tr>`;
        return;
    }
    filtered.forEach((advance, index) => {
        const row = DomElements.advancesTableBody.insertRow();
        let rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        if (advance.status === 'مستوفاة') { rowClass += ' advance-settled'; }
        else if (advance.status === 'مدفوع جزئياً') { rowClass += ' advance-partially-paid'; }
        row.className = rowClass;
        let actionsHTML = `<button class="text-indigo-600 hover:text-indigo-900 mr-2 edit-advance-btn" data-id="${advance.id}">تعديل</button>`;
        if (advance.status !== 'مستوفاة') {
            actionsHTML += `<button class="btn btn-info py-1 px-2 rounded-md text-xs mr-2 partial-payment-btn" data-id="${advance.id}">دفع جزء</button>`;
            actionsHTML += `<button class="btn btn-success py-1 px-2 rounded-md text-xs mr-2 settle-advance-btn" data-id="${advance.id}">استيفاء المتبقي</button>`;
        }
        actionsHTML += `<button class="text-red-600 hover:text-red-900 delete-advance-btn" data-id="${advance.id}" data-empname="${CSS.escape(advance.employeeName || 'Unknown')}" data-date="${advance.date}">حذف</button>`;
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${advance.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${advance.employeeName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${advance.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(advance.amount || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">${(advance.paidAmount || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">${(advance.remainingAmount || 0).toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${advance.reason || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${advance.status}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${advance.notes || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">${actionsHTML}</td>`;
    });
    updateSortIndicators('advancesTable', tableSortStates.advancesTable.column, tableSortStates.advancesTable.direction);
}

function renderCarAssignmentsTable(filterText = '') {
    if (!DomElements.carAssignmentsTableBody) return;
    DomElements.carAssignmentsTableBody.innerHTML = "";
    let filtered = employees.filter(emp =>
        (emp.name || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (emp.idNumber || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (emp.idIssuanceNumber || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (emp.carNumber || '').toLowerCase().includes(filterText.toLowerCase())
    );
    if (tableSortStates.carAssignmentsTable.column) {
        filtered = sortArray(filtered, tableSortStates.carAssignmentsTable.column, tableSortStates.carAssignmentsTable.direction);
    }
    if (filtered.length === 0) {
        DomElements.carAssignmentsTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center">لا توجد بيانات تخصيص سيارات مطابقة.</td></tr>`;
        return;
    }
    filtered.forEach((emp, index) => {
        const row = DomElements.carAssignmentsTableBody.insertRow();
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${emp.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${emp.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.idNumber || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.idIssuanceNumber || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.carNumber || 'غير محدد'}</td>`;
    });
    updateSortIndicators('carAssignmentsTable', tableSortStates.carAssignmentsTable.column, tableSortStates.carAssignmentsTable.direction);
}

function renderVacationsTable(globalFilterText = '') {
    if (!DomElements.vacationsTableBody) return;
    DomElements.vacationsTableBody.innerHTML = "";

    // احصل على قيم الفلاتر الجديدة
    const employeeNameFilter = document.getElementById('filterVacationEmployeeName')?.value.toLowerCase() || '';
    const vacationTypeFilter = document.getElementById('filterVacationType')?.value || '';
    const startDateFilter = document.getElementById('filterVacationStartDate')?.value || '';
    const endDateFilter = document.getElementById('filterVacationEndDate')?.value || '';
    const statusFilter = document.getElementById('filterVacationStatus')?.value || '';

    let filtered = vacations.filter(vac => {
        let matchesGlobal = true;
        if (globalFilterText) {
            matchesGlobal = (
                (vac.employeeName || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (vac.vacationType || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (vac.vacationStartDate || '').includes(globalFilterText) ||
                (vac.vacationEndDate || '').includes(globalFilterText) ||
                (vac.status || '').toLowerCase().includes(globalFilterText.toLowerCase()) ||
                (vac.notes || '').toLowerCase().includes(globalFilterText.toLowerCase())
            );
        }

        const matchesEmployeeName = !employeeNameFilter || (vac.employeeName || '').toLowerCase().includes(employeeNameFilter);
        const matchesVacationType = !vacationTypeFilter || vac.vacationType === vacationTypeFilter;
        const matchesStartDate = !startDateFilter || vac.vacationStartDate === startDateFilter;
        const matchesEndDate = !endDateFilter || vac.vacationEndDate === endDateFilter;
        const matchesStatus = !statusFilter || vac.status === statusFilter;

        return matchesGlobal && matchesEmployeeName && matchesVacationType && matchesStartDate && matchesEndDate && matchesStatus;
    });

    if (tableSortStates.vacationsTable.column) {
        filtered = sortArray(filtered, tableSortStates.vacationsTable.column, tableSortStates.vacationsTable.direction);
    }
    if (filtered.length === 0) {
        DomElements.vacationsTableBody.innerHTML = `<tr><td colspan="10" class="px-6 py-4 text-center">لا توجد سجلات إجازات مطابقة.</td></tr>`;
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered.forEach((vacation, index) => {
        const row = DomElements.vacationsTableBody.insertRow();
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        let statusClass = "text-gray-500";
        if (vacation.status === "حالية") statusClass = "text-orange-600 font-semibold";
        else if (vacation.status === "قادمة") statusClass = "text-blue-600";
        else if (vacation.status === "منتهية") statusClass = "text-gray-400 italic";


        let remainingTimeDisplay = "-";
        const vacationEndDate = new Date(vacation.vacationEndDate);
        vacationEndDate.setHours(0, 0, 0, 0);
        const vacationStartDate = new Date(vacation.vacationStartDate);
        vacationStartDate.setHours(0,0,0,0);

        if (vacation.status === "حالية") {
            const diffTime = vacationEndDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) {
                remainingTimeDisplay = "تنتهي اليوم";
            } else if (diffDays > 0) {
                remainingTimeDisplay = `${diffDays} يوم`;
            } else {
                remainingTimeDisplay = "انتهت";
            }
        } else if (vacation.status === "منتهية") {
            remainingTimeDisplay = "منتهية";
        } else if (vacation.status === "قادمة") {
            const diffTimeUntilStart = vacationStartDate.getTime() - today.getTime();
            const diffDaysUntilStart = Math.ceil(diffTimeUntilStart / (1000 * 60 * 60 * 24));
            if (diffDaysUntilStart === 0) {
                 remainingTimeDisplay = "تبدأ اليوم";
            } else if (diffDaysUntilStart > 0){
                 remainingTimeDisplay = `تبدأ بعد ${diffDaysUntilStart} يوم`;
            } else {
                 remainingTimeDisplay = "تاريخ البدء فات";
            }
        }


        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${vacation.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${vacation.employeeName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vacation.vacationType}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vacation.vacationStartDate}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vacation.vacationEndDate}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${vacation.duration > 0 ? vacation.duration : '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${statusClass}">${vacation.status}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${remainingTimeDisplay}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vacation.notes || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-vacation-btn" data-id="${vacation.id}">تعديل</button>
                <button class="text-red-600 hover:text-red-900 delete-vacation-btn" data-id="${vacation.id}" data-empname="${CSS.escape(vacation.employeeName || 'Unknown')}" data-startdate="${vacation.vacationStartDate}">حذف</button>
            </td>`;
    });
    updateSortIndicators('vacationsTable', tableSortStates.vacationsTable.column, tableSortStates.vacationsTable.direction);
}


// --- Alert/Notification Management Functions ---

/**
 * Updates the notification badge on the dashboard tab.
 */
function updateNotificationIndicator() {
    const totalAlerts = activeAlerts.length;
    if (DomElements.dashboardNotificationBadge) {
        if (totalAlerts > 0) {
            DomElements.dashboardNotificationBadge.textContent = totalAlerts;
            DomElements.dashboardNotificationBadge.classList.remove('hidden');
        } else {
            DomElements.dashboardNotificationBadge.classList.add('hidden');
        }
    }
}

/**
 * Adds an alert message to the activeAlerts array if it's not already present.
 * Each alert is prefixed with its type to allow clearing.
 * @param {string} type - 'residency', 'salary', 'violation'
 * @param {string} message - The raw HTML message content for the alert.
 */
function addAlert(type, message) {
    // Check if an alert of this exact type and content already exists to prevent duplicates
    const prefixedMessage = `[${type}]${message}`;
    if (!activeAlerts.includes(prefixedMessage)) {
        activeAlerts.push(prefixedMessage);
    }
    updateNotificationIndicator();
}

/**
 * Removes alerts of a specific type from the activeAlerts array.
 * @param {string} type - 'residency', 'salary', 'violation'
 */
function clearAlertsType(type) {
    activeAlerts = activeAlerts.filter(alert => !alert.startsWith(`[${type}]`));
    updateNotificationIndicator();
}

/**
 * Overrides the default showModal for 'confirmationModal' to display cumulative alerts.
 * @param {string} modalId - The ID of the modal to show.
 * @param {string} [message] - Optional message for the modal. If confirmationModal and no message, shows active alerts.
 * @param {Function} [callback] - Optional callback for confirmationModal.
 */
const originalShowModal = window.showModal; // Store original reference
window.showModal = function(modalId, message, callback) {
    if (modalId === 'confirmationModal') {
        if (DomElements.modalMessage) {
            if (message) { // If a specific message is passed (e.g., for delete confirmation)
                DomElements.modalMessage.innerHTML = message;
                confirmCallback = callback;
                if(DomElements.confirmActionButton) DomElements.confirmActionButton.style.display = callback ? "inline-block" : "none";
                const cancelButton = DomElements.confirmationModal.querySelector('.btn-secondary');
                if(cancelButton) cancelButton.textContent = callback ? "إلغاء" : "إغلاق";
            } else { // If no specific message, display accumulated active alerts
                if (activeAlerts.length > 0) {
                    DomElements.modalMessage.innerHTML = `<h3 class="text-lg font-bold text-red-700 mb-3">تنبيهات هامة:</h3>` +
                                                         activeAlerts.map(alert => {
                                                             const typeMatch = alert.match(/^\[(.*?)\]/);
                                                             let alertTypeClass = 'text-gray-700';
                                                             let alertContent = alert;
                                                             if (typeMatch) {
                                                                 const type = typeMatch[1];
                                                                 alertContent = alert.substring(typeMatch[0].length);
                                                                 if (type === 'residency' || type === 'violation') alertTypeClass = 'text-red-600';
                                                                 else if (type === 'salary') alertTypeClass = 'text-orange-600';
                                                             }
                                                             return `<div class="${alertTypeClass} mb-2">${alertContent}</div>`;
                                                         }).join('<hr class="my-3 border-gray-200">');
                    confirmCallback = null; // No action for general alerts
                    if(DomElements.confirmActionButton) DomElements.confirmActionButton.style.display = "none";
                    const cancelButton = DomElements.confirmationModal.querySelector('.btn-secondary');
                    if(cancelButton) cancelButton.textContent = "إغلاق";
                } else {
                    DomElements.modalMessage.innerHTML = `<p class="text-gray-500">لا توجد تنبيهات حالية.</p>`;
                    confirmCallback = null;
                    if(DomElements.confirmActionButton) DomElements.confirmActionButton.style.display = "none";
                    const cancelButton = DomElements.confirmationModal.querySelector('.btn-secondary');
                    if(cancelButton) cancelButton.textContent = "إغلاق";
                }
            }
        }
    } else { // For other modals, use the original function
        originalShowModal(modalId, message, callback);
    }
    const modalElement = DomElements[modalId];
    if (modalElement) modalElement.style.display = "block";
};


function checkResidencyExpiryAlerts() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const expiringEmployees = []; // within 90 days
    const expiredEmployees = []; // past expiry

    employees.forEach(emp => {
        if (emp.idExpiryDate) {
            const expiryDate = new Date(emp.idExpiryDate);
            expiryDate.setHours(0, 0, 0, 0);
            if (isNaN(expiryDate.getTime())) return;

            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                expiredEmployees.push(emp);
            } else if (diffDays <= 90) {
                expiringEmployees.push(emp);
            }
        }
    });

    clearAlertsType('residency'); // Clear previous residency alerts before adding new ones

    if (expiredEmployees.length > 0) {
        let msg = `<p class="font-bold mb-1">توجد إقامات منتهية:</p><ul>`;
        expiredEmployees.forEach(emp => { msg += `<li>الموظف: ${emp.name}، تنتهي في: ${emp.idExpiryDate}</li>`; });
        msg += `</ul>`;
        addAlert('residency', msg);
    }
    if (expiringEmployees.length > 0) {
        let msg = `<p class="font-bold mb-1">توجد إقامات شارفت على الانتهاء (خلال 90 يوماً):</p><ul>`;
        expiringEmployees.forEach(emp => {
            const expiryDate = new Date(emp.idExpiryDate);
            expiryDate.setHours(0, 0, 0, 0);
            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            msg += `<li>الموظف: ${emp.name}، تنتهي في: ${emp.idExpiryDate} (متبقي ${diffDays} يوماً)</li>`;
        });
        msg += `</ul>`;
        addAlert('residency', msg);
    }
}

function checkPendingSalariesAlerts() {
    const today = new Date();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = today.getFullYear().toString();
    const currentMonthYearStr = `${currentYear}-${currentMonth}`;

    let employeesWithoutSalary = employees.filter(emp =>
        !salaries.some(sal => sal.employeeId === emp.id && (sal.date || '').startsWith(currentMonthYearStr))
    );

    clearAlertsType('salary'); // Clear previous salary alerts before adding new ones

    if (employeesWithoutSalary.length > 0) {
        let msg = `<p class="font-bold mb-1">توجد رواتب لم يتم إدخالها لهذا الشهر (${ARABIC_MONTHS[today.getMonth()]} ${currentYear}):</p><ul>`;
        employeesWithoutSalary.forEach(emp => { msg += `<li>الموظف: ${emp.name}</li>`; });
        msg += `</ul><p>يرجى إدخال الرواتب لجميع الموظفين.</p>`;
        addAlert('salary', msg);
    }
}

function checkUnpaidViolationsAlerts() {
    const unpaidOrPendingViolations = violations.filter(vio =>
        vio.status === "غير مدفوعة" || vio.status === "قيد المراجعة"
    );

    clearAlertsType('violation'); // Clear previous violation alerts before adding new ones

    if (unpaidOrPendingViolations.length > 0) {
        let msg = `<p class="font-bold mb-1">توجد مخالفات غير مدفوعة أو قيد المراجعة:</p><ul>`;
        unpaidOrPendingViolations.forEach(vio => {
            const empName = (employees.find(e => e.id === vio.employeeId) || {}).name || 'غير معروف';
            msg += `<li>رقم المخالفة: ${vio.violationNumber || 'N/A'}، الموظف: ${empName}، المبلغ: ${(vio.amount || 0).toFixed(2)} ريال، الحالة: ${vio.status}</li>`;
        });
        msg += `</ul><p>يرجى مراجعة قسم إدارة المخالفات.</p>`;
        addAlert('violation', msg);
    }
}


// --- Edit functions ---
window.editCategory = async (id) => {
    const category = await getFromStore(STORE_CATEGORIES, id);
    if (category) {
        currentEditCategoryId = category.id;
        if (DomElements.categoryIdInput) DomElements.categoryIdInput.value = category.id;
        if (DomElements.categoryNameInput) DomElements.categoryNameInput.value = category.name;
        if (DomElements.saveCategoryButton) DomElements.saveCategoryButton.textContent = "تحديث قسم";
        if (DomElements.categoryNameInput) DomElements.categoryNameInput.focus();
    }
};
window.editEmployee = async (id) => {
    const employee = await getFromStore(STORE_EMPLOYEES, id);
    if (employee) {
        currentEditEmployeeId = employee.id;
        if (DomElements.employeeIdInput) DomElements.employeeIdInput.value = employee.id;
        if (DomElements.employeeNameInput) DomElements.employeeNameInput.value = employee.name;
        if (DomElements.employeeCategorySelect) DomElements.employeeCategorySelect.value = employee.categoryId;
        if (DomElements.employeeDateOfBirthInput) DomElements.employeeDateOfBirthInput.value = employee.dateOfBirth || '';
        if (DomElements.employeeIdNumberInput) DomElements.employeeIdNumberInput.value = employee.idNumber || '';
        if (DomElements.employeeIdExpiryDateInput) DomElements.employeeIdExpiryDateInput.value = employee.idExpiryDate || '';
        if (DomElements.employeeIdIssuanceNumberInput) DomElements.employeeIdIssuanceNumberInput.value = employee.idIssuanceNumber || '';
        if (DomElements.employeeCompanyNameInput) DomElements.employeeCompanyNameInput.value = employee.companyName || '';
        if (DomElements.employeeCompanyIdInput) DomElements.employeeCompanyIdInput.value = employee.companyId || '';
        if (DomElements.employeeCarNumberInput) DomElements.employeeCarNumberInput.value = employee.carNumber || '';
        if (DomElements.employeeNotesInput) DomElements.employeeNotesInput.value = employee.notes || '';
        if (DomElements.saveEmployeeButton) DomElements.saveEmployeeButton.textContent = "تحديث موظف";
        if (DomElements.employeeNameInput) DomElements.employeeNameInput.focus();
    }
};
window.editSalary = async (id) => {
    const salary = await getFromStore(STORE_SALARIES, id);
    if (salary) {
        currentEditSalaryId = salary.id;
        if (DomElements.salaryIdInput) DomElements.salaryIdInput.value = salary.id;
        if (DomElements.salaryEmployeeSelect) DomElements.salaryEmployeeSelect.value = salary.employeeId;
        if (DomElements.salaryBasicInput) DomElements.salaryBasicInput.value = salary.basic;
        if (DomElements.salaryAllowancesInput) DomElements.salaryAllowancesInput.value = salary.allowances;
        if (DomElements.salaryDeductionsInput) DomElements.salaryDeductionsInput.value = salary.deductions;
        if (DomElements.salaryDateInput) DomElements.salaryDateInput.value = salary.date;
        if (DomElements.salaryPaymentMethodSelect) DomElements.salaryPaymentMethodSelect.value = salary.paymentMethod || 'تحويل';
        if (DomElements.salaryPayrollPeriodInput) DomElements.salaryPayrollPeriodInput.value = salary.payrollPeriod || '';
        if (DomElements.saveSalaryButton) DomElements.saveSalaryButton.textContent = "تحديث راتب";
        if (DomElements.salaryEmployeeSelect) DomElements.salaryEmployeeSelect.focus();
        checkVacationForSalary(salary.employeeId.toString(), salary.date);
    }
};
window.editViolation = async (id) => {
    const violation = await getFromStore(STORE_VIOLATIONS, id);
    if (violation) {
        currentEditViolationId = violation.id;
        if(DomElements.violationIdInput) DomElements.violationIdInput.value = violation.id;
        if(DomElements.violationNumberInput) DomElements.violationNumberInput.value = violation.violationNumber || '';
        if(DomElements.violationDateInput) DomElements.violationDateInput.value = violation.date;
        if(DomElements.violationEmployeeSelect) DomElements.violationEmployeeSelect.value = violation.employeeId;
        if(DomElements.plateNumberInput) DomElements.plateNumberInput.value = violation.plateNumber || '';
        if(DomElements.cityInput) DomElements.cityInput.value = violation.city || '';
        if(DomElements.violationAmountInput) DomElements.violationAmountInput.value = violation.amount;
        if(DomElements.violationDetailsInput) DomElements.violationDetailsInput.value = violation.details || '';
        if(DomElements.violationStatusSelect) DomElements.violationStatusSelect.value = violation.status || 'غير مدفوعة';
        if(DomElements.violationNotesInput) DomElements.violationNotesInput.value = violation.notes || '';
        if(DomElements.saveViolationButton) DomElements.saveViolationButton.textContent = "تحديث المخالفة";
        if(DomElements.clearViolationFormButton) DomElements.clearViolationFormButton.textContent = "إلغاء التعديل";
        if(DomElements.violationEmployeeSelect) DomElements.violationEmployeeSelect.focus();
    }
};
window.editAdvance = async (id) => {
    const advance = await getFromStore(STORE_ADVANCES, id);
    if (advance) {
        currentEditAdvanceId = advance.id;
        if(DomElements.advanceIdInput) DomElements.advanceIdInput.value = advance.id;
        if(DomElements.advanceEmployeeSelect) DomElements.advanceEmployeeSelect.value = advance.employeeId;
        if(DomElements.advanceDateInput) DomElements.advanceDateInput.value = advance.date;
        if(DomElements.advanceAmountInput) DomElements.advanceAmountInput.value = (parseFloat(advance.amount) || 0).toFixed(2);
        if(DomElements.advanceReasonInput) DomElements.advanceReasonInput.value = advance.reason || '';
        if(DomElements.advanceNotesInput) DomElements.advanceNotesInput.value = advance.notes || '';
        if(DomElements.saveAdvanceButton) DomElements.saveAdvanceButton.textContent = "تحديث سلفة";
        if(DomElements.advanceEmployeeSelect) DomElements.advanceEmployeeSelect.focus();
    }
};
window.editVacation = async (id) => {
    const vacation = await getFromStore(STORE_VACATIONS, id);
    if (vacation) {
        currentEditVacationId = vacation.id;
        if(DomElements.vacationIdInput) DomElements.vacationIdInput.value = vacation.id;
        if(DomElements.vacationEmployeeSelect) DomElements.vacationEmployeeSelect.value = vacation.employeeId;
        if(DomElements.vacationTypeSelect) DomElements.vacationTypeSelect.value = vacation.vacationType;
        if(DomElements.vacationStartDateInput) DomElements.vacationStartDateInput.value = vacation.vacationStartDate;
        if(DomElements.vacationEndDateInput) DomElements.vacationEndDateInput.value = vacation.vacationEndDate;
        if(DomElements.vacationNotesInput) DomElements.vacationNotesInput.value = vacation.notes || '';
        if(DomElements.saveVacationButton) DomElements.saveVacationButton.textContent = "تحديث الإجازة";
        if(DomElements.vacationEmployeeSelect) DomElements.vacationEmployeeSelect.focus();
    }
};

// Confirmation/Delete functions
window.confirmDeleteCategory = (id, name) => {
    showModal('confirmationModal', `هل أنت متأكد أنك تريد حذف القسم "${name}"؟`, async () => {
        const isCategoryInUse = employees.some(emp => emp.categoryId === id);
        if (isCategoryInUse) {
            showToast(`لا يمكن حذف القسم "${name}" لأنه مستخدم من قبل موظف واحد على الأقل.`, "error");
            return;
        }
        try {
            await deleteCategoryAPI(id);
            showToast("تم حذف القسم بنجاح!", "success");
            await loadInitialData();
            if (currentEditCategoryId === id) clearCategoryForm();
        } catch (error) {
            showToast(`فشل الحذف: ${error.message}`, "error");
        }
    });
};
window.confirmDeleteEmployee = (id, name) => {
    showModal('confirmationModal', `هل أنت متأكد أنك تريد حذف الموظف "${name}"؟ سيتم حذف سجلات رواتبه ومخالفاته وسلفه وإجازاته أيضاً.`, async () => {
        try {
            await deleteEmployeeAPI(id);
            showToast("تم حذف الموظف بنجاح!", "success");
            await loadInitialData();
            if (currentEditEmployeeId === id) clearEmployeeForm();
        } catch (error) {
            showToast(`فشل الحذف: ${error.message}`, "error");
        }
    });
};
window.confirmDeleteSalary = (id, empName, date) => {
    showModal('confirmationModal', `هل أنت متأكد أنك تريد حذف سجل راتب الموظف "${empName}" بتاريخ ${date}؟`, async () => {
        try {
            await deleteSalaryAPI(id);
            showToast("تم حذف سجل الراتب بنجاح!", "success");
            await loadInitialData();
            if (currentEditSalaryId === id) clearSalaryForm();
        } catch (error) {
            showToast(`فشل الحذف: ${error.message}`, "error");
        }
    });
};
window.confirmDeleteViolation = (id, empName, date) => {
    showModal('confirmationModal', `هل أنت متأكد أنك تريد حذف مخالفة الموظف "${empName}" بتاريخ ${date}؟`, async () => {
        try {
            await deleteViolationAPI(id);
            showToast("تم حذف سجل المخالفة بنجاح!", "success");
            await loadInitialData();
            if (currentEditViolationId === id) clearViolationForm();
        } catch (error) {
            showToast(`فشل الحذف: ${error.message}`, "error");
        }
    });
};
window.confirmDeleteAdvance = (id, empName, date) => {
    showModal('confirmationModal', `هل أنت متأكد أنك تريد حذف سلفة الموظف "${empName}" بتاريخ ${date}؟`, async () => {
        try {
            await deleteAdvanceAPI(id);
            showToast("تم حذف سجل السلفة بنجاح!", "success");
            await loadInitialData();
            if (currentEditAdvanceId === id) clearAdvanceForm();
        } catch (error) {
            showToast(`فشل الحذف: ${error.message}`, "error");
        }
    });
};
window.confirmDeleteVacation = (id, empName, startDate) => {
    showModal('confirmationModal', `هل أنت متأكد أنك تريد حذف إجازة الموظف "${empName}" التي تبدأ بتاريخ ${startDate}؟`, async () => {
        try {
            await deleteVacationAPI(id);
            showToast("تم حذف سجل الإجازة بنجاح!", "success");
            await loadInitialData();
            if (currentEditVacationId === id) clearVacationForm();
        } catch (error) {
            showToast(`فشل الحذف: ${error.message}`, "error");
        }
    });
};

window.settleAdvance = async (id) => {
    const advance = await getFromStore(STORE_ADVANCES, id);
    if (!advance) { showToast("السلفة غير موجودة.", "error"); return; }
    const remainingToSettle = (parseFloat(advance.amount) || 0) - (parseFloat(advance.paidAmount) || 0);
    showModal('confirmationModal', `هل أنت متأكد أنك تريد استيفاء المبلغ المتبقي (${remainingToSettle.toFixed(2)} ريال) لهذه السلفة؟`, async () => {
        try {
            advance.paidAmount = parseFloat(advance.amount) || 0;
            advance.status = 'مستوفاة';
            await putIntoStore(STORE_ADVANCES, advance);
            showToast("تم استيفاء السلفة بنجاح!", "success");
            await loadInitialData();
        } catch (error) {
            showToast(`فشل استيفاء السلفة: ${error.message}`, "error");
        }
    });
};
window.showPartialPaymentModal = async (advanceId) => {
    const advance = await getFromStore(STORE_ADVANCES, advanceId);
    if (!advance) { showToast("السلفة غير موجودة.", "error"); return; }
    const employee = employees.find(e => e.id === advance.employeeId);
    const totalAmount = parseFloat(advance.amount) || 0;
    const paidAmount = parseFloat(advance.paidAmount) || 0;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    if(DomElements.partialPaymentAdvanceIdInput) DomElements.partialPaymentAdvanceIdInput.value = advanceId;
    if(DomElements.partialPaymentEmployeeNameSpan) DomElements.partialPaymentEmployeeNameSpan.textContent = employee ? employee.name : 'غير معروف';
    if(DomElements.partialPaymentTotalAmountSpan) DomElements.partialPaymentTotalAmountSpan.textContent = totalAmount.toFixed(2);
    if(DomElements.partialPaymentAlreadyPaidSpan) DomElements.partialPaymentAlreadyPaidSpan.textContent = paidAmount.toFixed(2);
    if(DomElements.partialPaymentRemainingAmountSpan) DomElements.partialPaymentRemainingAmountSpan.textContent = remainingAmount.toFixed(2);
    if(DomElements.partialPaymentAmountToPayInput) {
        DomElements.partialPaymentAmountToPayInput.value = '';
        DomElements.partialPaymentAmountToPayInput.max = remainingAmount.toFixed(2);
    }
    showModal('partialPaymentModal');
};

window.sortTable = function(tableId, columnKey) {
    let dataArray; let renderFunction; let filterInputElement;

    switch (tableId) {
        case 'categoriesTable': dataArray = categories; renderFunction = renderCategoriesTable; filterInputElement = DomElements.categoriesTableSearch; break;
        case 'employeesTable': dataArray = employees; renderFunction = renderEmployeesTable; filterInputElement = DomElements.employeesTableSearch; break;
        case 'salariesTable': dataArray = salaries; renderFunction = renderSalariesTable; filterInputElement = DomElements.salariesTableSearch; break;
        case 'violationsTable': dataArray = violations; renderFunction = renderViolationsTable; filterInputElement = DomElements.violationsTableSearch; break;
        case 'residencyExpiryTable': dataArray = employees; renderFunction = renderResidencyExpiryTable; filterInputElement = DomElements.residencyExpiryTableSearch; break;
        case 'advancesTable': dataArray = advances; renderFunction = renderAdvancesTable; filterInputElement = DomElements.advancesTableSearch; break;
        case 'carAssignmentsTable': dataArray = employees; renderFunction = renderCarAssignmentsTable; filterInputElement = DomElements.carAssignmentsTableSearch; break;
        case 'vacationsTable': dataArray = vacations; renderFunction = renderVacationsTable; filterInputElement = DomElements.vacationsTableSearch; break;
        default: console.error("Unknown tableId for sorting:", tableId); return;
    }

    if (tableSortStates[tableId].column === columnKey) {
        tableSortStates[tableId].direction = tableSortStates[tableId].direction === 'asc' ? 'desc' : 'asc';
    } else {
        tableSortStates[tableId].column = columnKey;
        tableSortStates[tableId].direction = 'asc';
    }

    if ((tableId === 'vacationsTable' && columnKey === 'remainingTime') || (tableId === 'employeesTable' && columnKey === 'vacationStatus')) {
        renderFunction(filterInputElement ? filterInputElement.value : '');
    } else {
        const filterValue = filterInputElement ? filterInputElement.value : '';
        if(typeof renderFunction === 'function') {
            renderFunction(filterValue);
        } else {
            console.error(`Render function for table ${tableId} is not defined.`);
        }
    }
    updateSortIndicators(tableId, tableSortStates[tableId].column, tableSortStates[tableId].direction);
};


// --- Dashboard Functions ---
function renderDashboard() {
    if(DomElements.totalEmployeesCount) DomElements.totalEmployeesCount.textContent = employees.length;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    const currentMonthYearStr = `${currentYear}-${currentMonth}`;
    const totalSalariesLastMonth = salaries.filter(s => (s.date || '').startsWith(currentMonthYearStr)).reduce((sum, s) => sum + (s.total || 0), 0);
    if(DomElements.totalMonthlySalaries) DomElements.totalMonthlySalaries.textContent = `${totalSalariesLastMonth.toFixed(2)} ريال`;

    const expiringOrExpiredCount = employees.filter(emp => {
        if (emp.idExpiryDate) {
            const expiryDate = new Date(emp.idExpiryDate);
            expiryDate.setHours(0, 0, 0, 0);
            if (isNaN(expiryDate.getTime())) return false;
            const diffTime = expiryDate.getTime() - new Date().setHours(0,0,0,0);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 90;
        }
        return false;
    }).length;
    if(DomElements.expiringResidenciesCount) DomElements.expiringResidenciesCount.textContent = expiringOrExpiredCount;

    const totalOutstandingAdvancesAmount = advances.filter(adv => adv.status !== 'مستوفاة').reduce((sum, adv) => sum + (adv.remainingAmount || 0), 0);
    if(DomElements.totalOutstandingAdvances) DomElements.totalOutstandingAdvances.textContent = `${totalOutstandingAdvancesAmount.toFixed(2)} ريال`;

    const unpaidOrPendingViolationsCount = violations.filter(vio => vio.status === "غير مدفوعة" || vio.status === "قيد المراجعة").length;
    if(DomElements.unpaidViolationsCount) DomElements.unpaidViolationsCount.textContent = unpaidOrPendingViolationsCount;

    const todayForVacationCheck = new Date();
    todayForVacationCheck.setHours(0,0,0,0);
    const employeesOnVacation = vacations.filter(vac => {
        const startDate = new Date(vac.vacationStartDate);
        startDate.setHours(0,0,0,0);
        const endDate = new Date(vac.vacationEndDate);
        endDate.setHours(0,0,0,0);
        return startDate <= todayForVacationCheck && endDate >= todayForVacationCheck;
    }).length;
    if(DomElements.employeesOnVacationCount) DomElements.employeesOnVacationCount.textContent = employeesOnVacation;


    populateDashboardYears();
    if(DomElements.dashboardYearSelect && DomElements.dashboardYearSelect.value) {
      renderAnnualSalarySummary(DomElements.dashboardYearSelect.value);
    } else if (DomElements.dashboardYearSelect) {
        const currentYr = new Date().getFullYear().toString();
        DomElements.dashboardYearSelect.value = currentYr;
        renderAnnualSalarySummary(currentYr);
    }
}

function populateDashboardYears() {
    if(!DomElements.dashboardYearSelect) return;
    DomElements.dashboardYearSelect.innerHTML = "";
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        DomElements.dashboardYearSelect.appendChild(option);
    }
     DomElements.dashboardYearSelect.value = currentYear;
}

function renderAnnualSalarySummary(year) {
    if(!DomElements.annualSalarySummary) return;
    if (!year) {
        DomElements.annualSalarySummary.innerHTML = `<p class="text-gray-500">يرجى اختيار سنة لعرض الملخص السنوي.</p>`;
        return;
    }
    const salariesForYear = salaries.filter(s => (s.date || '').startsWith(year));
    if (salariesForYear.length === 0) {
        DomElements.annualSalarySummary.innerHTML = `<p class="text-gray-500">لا توجد بيانات رواتب للسنة ${year}.</p>`;
        return;
    }

    const monthlyTotals = {};
    ARABIC_MONTHS.forEach((monthName, index) => {
        const monthNum = (index + 1).toString().padStart(2, '0');
        monthlyTotals[monthNum] = { name: monthName, total: 0 };
    });

    salariesForYear.forEach(salary => {
        const monthNum = (salary.date || '').substring(5, 7);
        if (monthlyTotals[monthNum]) {
            monthlyTotals[monthNum].total += (salary.total || 0);
        }
    });

    let tableHTML = `<table class="min-w-full divide-y divide-gray-200 border border-gray-300 mt-2">
        <thead class="table-header">
            <tr>
                <th class="px-4 py-2 text-right">الشهر</th>
                <th class="px-4 py-2 text-right">إجمالي صافي الراتب (ريال)</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">`;
    let grandTotalAnnual = 0;
    Object.keys(monthlyTotals).sort().forEach((monthNum) => {
        const data = monthlyTotals[monthNum];
        tableHTML += `<tr>
            <td class="px-4 py-2">${data.name}</td>
            <td class="px-4 py-2 text-left">${data.total.toFixed(2)}</td>
        </tr>`;
        grandTotalAnnual += data.total;
    });
    tableHTML += `<tr class="bg-gray-100 font-bold">
        <td class="px-4 py-2">الإجمالي السنوي:</td>
        <td class="px-4 py-2" colspan="1"></td>
        <td class="px-4 py-2 text-left text-indigo-700">${grandTotalAnnual.toFixed(2)}</td>
    </tr>`;
    tableHTML += `</tbody></table>`;
    DomElements.annualSalarySummary.innerHTML = tableHTML;
}

// --- Report Related Event Handlers ---
function populateReportYears(selectElement) {
    if (!selectElement) return;
    const currentVal = selectElement.value;
    selectElement.innerHTML = "";
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        selectElement.appendChild(option);
    }
    if (Array.from(selectElement.options).some(opt => opt.value === currentVal) && currentVal) {
        selectElement.value = currentVal;
    } else {
        selectElement.value = currentYear.toString(); // تأكد من أنه نص
    }

    if (selectElement.value) {
        if (selectElement === DomElements.reportYearSelect) populateReportMonths(DomElements.reportMonthSelect, selectElement.value);
        else if (selectElement === DomElements.customReportYearSelect) populateReportMonths(DomElements.customReportMonthSelect, selectElement.value);
    }
}

function populateReportMonths(monthSelectElement, year) {
    if (!monthSelectElement) return;
    const previousValue = monthSelectElement.value;
    monthSelectElement.innerHTML = "";
    const allMonthsOption = document.createElement('option');
    allMonthsOption.value = "all";
    allMonthsOption.textContent = "كل الشهور";
    monthSelectElement.appendChild(allMonthsOption);

    ARABIC_MONTHS.forEach((monthName, index) => {
        const option = document.createElement('option');
        option.value = (index + 1).toString().padStart(2, '0');
        option.textContent = monthName;
        monthSelectElement.appendChild(option);
    });

    if (Array.from(monthSelectElement.options).some(opt => opt.value === previousValue) && previousValue) {
        monthSelectElement.value = previousValue;
    } else {
        monthSelectElement.value = "all";
    }
    monthSelectElement.disabled = !year;
}

// --- Export Functions ---
// هذه الدالة يفترض أنها موجودة في مكان ما (مثل script_part2_database_data_management.js أو في هذا الملف)
// أو يجب تضمينها. هنا يتم تضمينها لضمان الحل الكامل.
// الحل لمشكلة الأحرف العربية هنا: تحديد 'application/json;charset=utf-8'
async function downloadJson(data, filename) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' }); //

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        showToast("تم إنشاء النسخة الاحتياطية بنجاح!", "success"); //
    } catch (error) {
        console.error("خطأ في إنشاء أو تنزيل ملف JSON:", error); //
        showToast(`فشل إنشاء النسخة الاحتياطية: ${error.message}`, "error"); //
    }
}
// هذه الدالة يفترض أنها موجودة (مثل script_part2_database_data_management.js أو في هذا الملف)
// أو يجب تضمينها. هنا يتم تضمينها لضمان الحل الكامل.
async function clearObjectStore(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite'); //
        const store = transaction.objectStore(storeName); //
        const request = store.clear(); //

        request.onsuccess = () => {
            console.log(`Object store '${storeName}' cleared.`); //
            resolve(); //
        };

        request.onerror = (e) => {
            console.error(`Error clearing object store '${storeName}':`, e.target.error); //
            reject(e.target.error); //
        };
    });
}

// كود دالة exportTableToExcel
// يفترض أنها موجودة لديك. إذا لم تكن كذلك، فيجب تضمينها.
// بما أنها تتعامل مع HTML إلى Excel، يجب التأكد من أنها تستخدم مكتبة مثل SheetJS (xlsx)
// التي تدعم UTF-8 عند إنشاء ملف Excel.
function exportTableToExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) {
        showToast("لم يتم العثور على الجدول للتصدير.", "error");
        return;
    }

    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    // استخدام XLSX.writeFile مع 'utf8' ترميز في الخيارات إذا كان ذلك ممكنًا،
    // ولكن عادةً ما تتعامل المكتبة معها بشكل جيد.
    XLSX.writeFile(wb, `${filename}.xlsx`);
    showToast("تم تصدير البيانات إلى Excel بنجاح!", "success");
}


// كود دالة exportContentToPdf
// يفترض أنها موجودة لديك. إذا لم تكن كذلك، فيجب تضمينها.
// هذه الدالة تعتمد على jspdf و html2canvas، وهي تتعامل عادةً مع UTF-8 بشكل جيد.
// لكن يجب التأكد من الخطوط المستخدمة في PDF تدعم الأحرف العربية.
async function exportContentToPdf(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        showToast("لم يتم العثور على المحتوى للتصدير إلى PDF.", "error");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const canvas = await html2canvas(element, { scale: 2 }); // زيادة المقياس لتحسين الجودة
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'p', // 'p' for portrait, 'l' for landscape
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${filename}.pdf`);
        showToast("تم تصدير البيانات إلى PDF بنجاح!", "success");
    } catch (error) {
        console.error("خطأ في تصدير PDF:", error);
        showToast(`فشل تصدير البيانات إلى PDF: ${error.message}`, "error");
    }
}


async function restoreData(backupData) {
    try {
        // مسح جميع المخازن أولاً
        await clearObjectStore(STORE_CATEGORIES); //
        await clearObjectStore(STORE_EMPLOYEES); //
        await clearObjectStore(STORE_SALARIES); //
        await clearObjectStore(STORE_VIOLATIONS); //
        await clearObjectStore(STORE_ADVANCES); //
        await clearObjectStore(STORE_VACATIONS); //

        // بدء معاملة لكافة المخازن لتسريع عملية الاستعادة
        const transaction = db.transaction([STORE_CATEGORIES, STORE_EMPLOYEES, STORE_SALARIES, STORE_VIOLATIONS, STORE_ADVANCES, STORE_VACATIONS], 'readwrite'); //

        const storesToRestore = {
            [STORE_CATEGORIES]: backupData.categories || [],
            [STORE_EMPLOYEES]: backupData.employees || [],
            [STORE_SALARIES]: backupData.salaries || [],
            [STORE_VIOLATIONS]: backupData.violations || [],
            [STORE_ADVANCES]: backupData.advances || [],
            [STORE_VACATIONS]: backupData.vacations || []
        };

        // إضافة البيانات إلى كل مخزن
        for (const storeName in storesToRestore) { //
            const objectStore = transaction.objectStore(storeName); //
            for (const item of storesToRestore[storeName]) { //
                await new Promise((resolve, reject) => {
                    const request = objectStore.put(item); //
                    request.onsuccess = () => resolve(); //
                    request.onerror = (e) => {
                        console.error(`Error putting item into ${storeName}:`, e.target.error, item); //
                        reject(e.target.error); //
                    };
                });
            }
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = async () => {
                console.log("All data restored successfully."); //
                showToast("تم استعادة البيانات بنجاح!", "success"); //
                await loadInitialData(); //
                resolve(); //
            };
            transaction.onerror = (e) => {
                console.error("Transaction failed during restore:", e.target.error); //
                showToast(`فشل استعادة البيانات بالكامل: ${e.target.error}`, "error"); //
                reject(e.target.error); //
            };
        });

    } catch (error) {
        console.error("خطأ أثناء عملية الاستعادة:", error); //
        showToast(`فشل استعادة البيانات: ${error.message}`, "error"); //
    }
}
async function checkAndTriggerAutoBackup() { /* كود الدالة كما هو، مع التأكد من شمول الإجازات */ }


 //--- Authentication Functions ---
function checkLoginStatus() {
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}

function handleLogout() {
    showModal('confirmationModal', "هل أنت متأكد أنك تريد تسجيل الخروج؟", () => {
        sessionStorage.removeItem('loggedIn');
        sessionStorage.removeItem('username');
        window.location.href = 'login.html';
    });
}


// --- Initial Load ---
async function loadInitialData() {
    console.log("Starting loadInitialData...");
    // يعرض رسالة "جاري التحميل" في الجداول أثناء تحميل البيانات
    if(DomElements.categoriesTableBody) DomElements.categoriesTableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center">جاري تحميل الأقسام...</td></tr>`;
    if(DomElements.employeesTableBody) DomElements.employeesTableBody.innerHTML = `<tr><td colspan="13" class="px-6 py-4 text-center">جاري تحميل الموظفين...</td></tr>`;
    if(DomElements.salariesTableBody) DomElements.salariesTableBody.innerHTML = `<tr><td colspan="10" class="px-6 py-4 text-center">جاري تحميل الرواتب...</td></tr>`;
    if(DomElements.violationsTableBody) DomElements.violationsTableBody.innerHTML = `<tr><td colspan="11" class="px-6 py-4 text-center">جاري تحميل المخالفات...</td></tr>`;
    if(DomElements.residencyExpiryTableBody) DomElements.residencyExpiryTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center">جاري تحميل تواريخ انتهاء الإقامة...</td></tr>`;
    if(DomElements.advancesTableBody) DomElements.advancesTableBody.innerHTML = `<tr><td colspan="10" class="px-6 py-4 text-center">جاري تحميل السلف...</td></tr>`;
    if(DomElements.carAssignmentsTableBody) DomElements.carAssignmentsTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center">جاري تحميل تخصيصات السيارات...</td></tr>`;
    if(DomElements.vacationsTableBody) DomElements.vacationsTableBody.innerHTML = `<tr><td colspan="10" class="px-6 py-4 text-center">جاري تحميل الإجازات...</td></tr>`;
    if(DomElements.annualSalarySummary) DomElements.annualSalarySummary.innerHTML = `<p class="text-gray-500">جاري تحميل ملخص الرواتب السنوي...</p>`;


    try {
        console.log("Attempting to open IndexedDB...");
        await openDB(); // هذه الدالة مهمة، ويجب أن تعمل بشكل صحيح
        console.log("IndexedDB opened. Fetching data...");

        // فحص ترتيب تحميل البيانات. يجب تحميل الموظفين والأقسام قبل الرواتب والمخالفات والسلف والإجازات لربط الأسماء.
        await fetchCategoriesAPI();
        await fetchEmployeesAPI();
        await fetchVacationsAPI(); // ⭐ يجب التأكد من تحميل الإجازات بنجاح
        await fetchSalariesAPI();
        await fetchViolationsAPI();
        await fetchAdvancesAPI();


        renderCategoriesTable();
        populateCategorySelects(DomElements.employeeCategorySelect, "اختر فئة...");
        populateCategorySelects(DomElements.customReportCategorySelect, "جميع الفئات");
        populateEmployeeCategoryFilter();

        // فحص هذه الدوال للتأكد من أنها تعبئ الجداول بشكل صحيح بعد تحميل البيانات
        renderEmployeesTable(DomElements.employeesTableSearch ? DomElements.employeesTableSearch.value : '');
        populateEmployeeSelects(DomElements.salaryEmployeeSelect, "اختر موظف...", true);
        populateEmployeeSelects(DomElements.customReportEmployeeSelect, "جميع الموظفين", true);
        populateEmployeeSelects(DomElements.violationEmployeeSelect, "اختر موظف للمخالفة...", false);
        populateEmployeeSelects(DomElements.advanceEmployeeSelect, "اختر موظف للسلفة...", false);
        populateEmployeeSelects(DomElements.vacationEmployeeSelect, "اختر موظف للإجازة...", false);
        renderResidencyExpiryTable();

        renderSalariesTable();
        renderViolationsTable();
        renderAdvancesTable();
        renderCarAssignmentsTable();
        renderVacationsTable(); // ⭐ يجب التأكد من عمل هذه الدالة بشكل سليم


        // وظائف تعبئة قوائم التقارير
        if (DomElements.reportYearSelect) populateReportYears(DomElements.reportYearSelect);
        if (DomElements.customReportYearSelect) populateReportYears(DomElements.customReportYearSelect);


        clearCategoryForm();
        clearEmployeeForm();
        clearSalaryForm();
        clearViolationForm();
        clearAdvanceForm();
        clearVacationForm();

        // منطق فتح التبويب الافتراضي أو الأخير
        const activeTabButton = document.querySelector('.tab-button.active');
        const defaultTab = 'dashboard';
        let tabToOpen = defaultTab;

        if (activeTabButton && DomElements.tabButtons && Array.from(DomElements.tabButtons).some(btn => btn.dataset.tab === activeTabButton.dataset.tab)) {
             tabToOpen = activeTabButton.dataset.tab;
        } else if (DomElements.tabButtons && DomElements.tabButtons.length > 0 && DomElements.tabButtons[0].dataset.tab) {
             tabToOpen = DomElements.tabButtons[0].dataset.tab;
        }
        openTab(tabToOpen); // هذه الدالة مهمة جداً لتبديل التبويبات

        // تشغيل التنبيهات عند التحميل
        // يجب أن يتم استدعاء check...Alerts لتعبئة activeAlerts ثم تحديث المؤشر
        checkResidencyExpiryAlerts();
        checkPendingSalariesAlerts();
        checkUnpaidViolationsAlerts();
        updateNotificationIndicator(); // تحديث المؤشر بعد جميع عمليات التحقق

        // إذا كانت هناك تنبيهات، افتح نافذة التنبيهات تلقائياً عند التحميل
        if (activeAlerts.length > 0) {
            showModal('confirmationModal'); // استدعاء showModal بدون رسالة ليعرض التنبيهات المتراكمة
        }


        // checkAndTriggerAutoBackup(); // قم بإلغاء التعليق إذا كنت تستخدم هذه الدالة

        console.log("All initial data loaded successfully.");

    } catch (error) {
        console.error("Failed to load initial data:", error);
        if(DomElements.reportOutput) DomElements.reportOutput.innerHTML = `<p class="text-red-500">فشل تحميل البيانات الأولية. يرجى التحقق من وحدة التحكم ومحاولة تحديث الصفحة. الخطأ: ${error.message}</p>`;
        showToast(`فشل تحميل البيانات الأولية: ${error.message}`, "error", 10000);
    }
}

async function checkVacationForSalary(employeeIdStr, salaryDateStr) {
    if (!employeeIdStr || !salaryDateStr || !DomElements.salaryVacationInfo || !DomElements.vacationAlertMessage) {
        if (DomElements.salaryVacationInfo) DomElements.salaryVacationInfo.style.display = 'none';
        return;
    }
    const employeeId = parseInt(employeeIdStr);
    if (isNaN(employeeId) || employeeId === 0) {
        if (DomElements.salaryVacationInfo) DomElements.salaryVacationInfo.style.display = 'none';
        return;
    }


    const salaryDate = new Date(salaryDateStr);
    const salaryMonth = salaryDate.getMonth();
    const salaryYear = salaryDate.getFullYear();

    const salaryMonthStart = new Date(salaryYear, salaryMonth, 1);
    const salaryMonthEnd = new Date(salaryYear, salaryMonth + 1, 0);

    const employeeVacationsInPeriod = vacations.filter(v =>
        v.employeeId === employeeId
    );

    let alertMsg = "";
    let unpaidVacationDaysInMonth = 0;

    employeeVacationsInPeriod.forEach(vac => {
        const vacStart = new Date(vac.vacationStartDate);
        const vacEnd = new Date(vac.vacationEndDate);

        const overlapStart = new Date(Math.max(vacStart.getTime(), salaryMonthStart.getTime()));
        const overlapEnd = new Date(Math.min(vacEnd.getTime(), salaryMonthEnd.getTime()));

        if (overlapStart <= overlapEnd) {
            const daysInOverlap = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            alertMsg += `الموظف لديه إجازة (${vac.vacationType}) من ${vac.vacationStartDate} إلى ${vac.vacationEndDate} (تتداخل بـ ${daysInOverlap} يوم/أيام مع شهر الراتب). `;
            if (vac.vacationType === 'بدون راتب') {
                unpaidVacationDaysInMonth += daysInOverlap;
            }
        }
    });

    if (alertMsg) {
        if (unpaidVacationDaysInMonth > 0) {
            alertMsg += ` منها ${unpaidVacationDaysInMonth} يوم/أيام بدون راتب خلال شهر الراتب هذا. `;
            showToast(`تنبيه: يوجد ${unpaidVacationDaysInMonth} يوم/أيام إجازة بدون راتب في هذا الشهر للموظف. يرجى تعديل الخصومات يدويًا إذا لزم الأمر.`, 'info', 7000);
        }
        DomElements.vacationAlertMessage.textContent = alertMsg;
        DomElements.salaryVacationInfo.style.display = 'block';

    } else {
        DomElements.salaryVacationInfo.style.display = 'none';
    }
}


// --- Event Listeners Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus(); // يتم التحقق من حالة تسجيل الدخول أولاً
    loadInitialData();

    DomElements.tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            openTab(e.target.dataset.tab);
            // If dashboard tab is opened, and there are alerts, show the modal
            if (e.target.dataset.tab === 'dashboard' && activeAlerts.length > 0) {
                showModal('confirmationModal');
            }
        });
    });

    document.querySelectorAll('[data-close-modal]').forEach(button => {
        button.addEventListener('click', (e) => closeModal(e.target.dataset.closeModal));
    });

    if (DomElements.confirmActionButton) {
        DomElements.confirmActionButton.addEventListener('click', () => {
            if (confirmCallback) confirmCallback();
            closeModal('confirmationModal');
        });
    }

    // Category Form
    if (DomElements.categoryForm) DomElements.categoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = DomElements.categoryNameInput.value.trim();
        if (!name) { showToast("يرجى إدخال اسم القسم.", "error"); return; }
        DomElements.saveCategoryButton.disabled = true; DomElements.saveCategoryButton.textContent = currentEditCategoryId ? "جاري التحديث..." : "جاري الإضافة...";
        try {
            if (currentEditCategoryId) { await updateCategoryAPI(currentEditCategoryId, name); showToast("تم تحديث القسم بنجاح!", "success"); }
            else { await addCategoryAPI(name); showToast("تمت إضافة القسم بنجاح!", "success"); }
            clearCategoryForm(); await loadInitialData();
        } catch (error) { showToast(`فشل: ${error.message}`, "error"); }
        finally { DomElements.saveCategoryButton.disabled = false; DomElements.saveCategoryButton.textContent = currentEditCategoryId ? "تحديث قسم" : "إضافة قسم"; if (!currentEditCategoryId) DomElements.saveCategoryButton.textContent = "إضافة قسم"; }
    });
    if (DomElements.clearCategoryFormButton) DomElements.clearCategoryFormButton.addEventListener('click', clearCategoryForm);
    if (DomElements.categoriesTableSearch) DomElements.categoriesTableSearch.addEventListener('input', (e) => renderCategoriesTable(e.target.value));

    // Employee Form
    if (DomElements.employeeForm) DomElements.employeeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = DomElements.employeeNameInput.value.trim();
        const categoryId = DomElements.employeeCategorySelect.value;
        const dateOfBirth = DomElements.employeeDateOfBirthInput.value;
        const idNumber = DomElements.employeeIdNumberInput.value.trim();
        const idExpiryDate = DomElements.employeeIdExpiryDateInput.value;
        const idIssuanceNumber = DomElements.employeeIdIssuanceNumberInput.value.trim();
        const companyName = DomElements.employeeCompanyNameInput.value.trim();
        const companyId = DomElements.employeeCompanyIdInput.value.trim();
        const carNumber = DomElements.employeeCarNumberInput.value.trim();
        const notes = DomElements.employeeNotesInput.value.trim();

        if (!name || !categoryId) {
            showToast("يرجى إدخال اسم الموظف واختيار فئته.", "error");
            return;
        }

        const employeeData = {
            name, categoryId: parseInt(categoryId), dateOfBirth, idNumber, idExpiryDate, idIssuanceNumber,
            companyName, companyId, carNumber, notes
        };

        DomElements.saveEmployeeButton.disabled = true;
        DomElements.saveEmployeeButton.textContent = currentEditEmployeeId ? "جاري التحديث..." : "جاري الإضافة...";

        try {
            if (currentEditEmployeeId) {
                await updateEmployeeAPI(currentEditEmployeeId, employeeData);
                showToast("تم تحديث بيانات الموظف بنجاح!", "success");
            } else {
                await addEmployeeAPI(employeeData);
                showToast("تمت إضافة الموظف بنجاح!", "success");
            }
            clearEmployeeForm();
            await loadInitialData();
        } catch (error) {
            showToast(`فشل: ${error.message}`, "error");
        } finally {
            DomElements.saveEmployeeButton.disabled = false;
            DomElements.saveEmployeeButton.textContent = currentEditEmployeeId ? "تحديث موظف" : "إضافة موظف";
            if (!currentEditEmployeeId) DomElements.saveEmployeeButton.textContent = "إضافة موظف";
        }
    });
    if (DomElements.clearEmployeeFormButton) DomElements.clearEmployeeFormButton.addEventListener('click', clearEmployeeForm);
    if (DomElements.employeesTableSearch) DomElements.employeesTableSearch.addEventListener('input', (e) => renderEmployeesTable(e.target.value));
    if (DomElements.filterEmployeeName) DomElements.filterEmployeeName.addEventListener('input', () => renderEmployeesTable(DomElements.employeesTableSearch.value));
    if (DomElements.filterEmployeeCategory) DomElements.filterEmployeeCategory.addEventListener('change', () => renderEmployeesTable(DomElements.employeesTableSearch.value));
    if (DomElements.filterEmployeeIdNumber) DomElements.filterEmployeeIdNumber.addEventListener('input', () => renderEmployeesTable(DomElements.employeesTableSearch.value));
    if (DomElements.filterEmployeeCompanyName) DomElements.filterEmployeeCompanyName.addEventListener('input', () => renderEmployeesTable(DomElements.employeesTableSearch.value));
    if (DomElements.filterEmployeeCarNumber) DomElements.filterEmployeeCarNumber.addEventListener('input', () => renderEmployeesTable(DomElements.employeesTableSearch.value));


    // Salary Form
    if (DomElements.salaryForm) DomElements.salaryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const employeeId = DomElements.salaryEmployeeSelect.value;
        const basic = DomElements.salaryBasicInput.value;
        const allowances = DomElements.salaryAllowancesInput.value;
        const deductions = DomElements.salaryDeductionsInput.value;
        const date = DomElements.salaryDateInput.value;
        const paymentMethod = DomElements.salaryPaymentMethodSelect.value;
        const payrollPeriod = DomElements.salaryPayrollPeriodInput.value.trim();

        if (!employeeId || !basic || !date) {
            showToast("يرجى ملء الحقول الأساسية للراتب (الموظف، الأساسي، التاريخ).", "error");
            return;
        }
        if (isNaN(parseFloat(basic)) || isNaN(parseFloat(allowances)) || isNaN(parseFloat(deductions))) {
            showToast("يرجى إدخال قيم رقمية صحيحة للراتب والبدلات والخصومات.", "error");
            return;
        }

        const salaryData = {
            employeeId: parseInt(employeeId),
            basic: parseFloat(basic),
            allowances: parseFloat(allowances),
            deductions: parseFloat(deductions),
            date,
            paymentMethod,
            payrollPeriod
        };

        DomElements.saveSalaryButton.disabled = true;
        DomElements.saveSalaryButton.textContent = currentEditSalaryId ? "جاري التحديث..." : "جاري الإضافة...";

        try {
            if (currentEditSalaryId) {
                await updateSalaryAPI(currentEditSalaryId, salaryData);
                showToast("تم تحديث الراتب بنجاح!", "success");
            } else {
                await addSalaryAPI(salaryData);
                showToast("تمت إضافة الراتب بنجاح!", "success");
            }
            clearSalaryForm();
            await loadInitialData();
        } catch (error) {
            showToast(`فشل: ${error.message}`, "error");
        } finally {
            DomElements.saveSalaryButton.disabled = false;
            DomElements.saveSalaryButton.textContent = currentEditSalaryId ? "تحديث راتب" : "إضافة راتب";
            if (!currentEditSalaryId) DomElements.saveSalaryButton.textContent = "إضافة راتب";
        }
    });
    if (DomElements.clearSalaryFormButton) DomElements.clearSalaryFormButton.addEventListener('click', clearSalaryForm);
    if (DomElements.copyPreviousMonthSalaryButton) DomElements.copyPreviousMonthSalaryButton.addEventListener('click', async () => {
        const employeeId = DomElements.salaryEmployeeSelect.value;
        if (!employeeId) {
            showToast("يرجى اختيار موظف أولاً لنسخ راتب الشهر السابق.", "info");
            return;
        }

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // حاول الحصول على راتب الشهر الحالي أولاً للتأكد من عدم وجود تكرار
        const currentMonthSalaryExists = salaries.some(sal =>
            sal.employeeId === parseInt(employeeId) &&
            new Date(sal.date).getMonth() === currentMonth &&
            new Date(sal.date).getFullYear() === currentYear
        );

        if (currentMonthSalaryExists) {
            showToast("يوجد بالفعل راتب مدخل لهذا الموظف في الشهر الحالي. لا يمكن النسخ.", "warning");
            return;
        }

        // احسب الشهر السابق
        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth < 0) {
            prevMonth = 11; // ديسمبر
            prevYear--;
        }

        const prevMonthSalary = salaries.find(sal =>
            sal.employeeId === parseInt(employeeId) &&
            new Date(sal.date).getMonth() === prevMonth &&
            new Date(sal.date).getFullYear() === prevYear
        );

        if (prevMonthSalary) {
            // قم بملء الحقول ببيانات الشهر السابق
            if (DomElements.salaryBasicInput) DomElements.salaryBasicInput.value = prevMonthSalary.basic;
            if (DomElements.salaryAllowancesInput) DomElements.salaryAllowancesInput.value = prevMonthSalary.allowances;
            if (DomElements.salaryDeductionsInput) DomElements.salaryDeductionsInput.value = prevMonthSalary.deductions;
            if (DomElements.salaryPaymentMethodSelect) DomElements.salaryPaymentMethodSelect.value = prevMonthSalary.paymentMethod || 'تحويل';

            // قم بتعيين تاريخ الراتب الحالي إلى تاريخ آخر يوم في الشهر الحالي
            const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
            if (DomElements.salaryDateInput) DomElements.salaryDateInput.value = lastDayOfCurrentMonth.toISOString().slice(0, 10);

            // قم بتعيين فترة الراتب إلى الشهر الحالي
            const payrollPeriodMonthName = ARABIC_MONTHS[currentMonth];
            if (DomElements.salaryPayrollPeriodInput) DomElements.salaryPayrollPeriodInput.value = `${payrollPeriodMonthName} ${currentYear}`;

            showToast("تم نسخ راتب الشهر السابق بنجاح!", "success");
            checkVacationForSalary(employeeId, DomElements.salaryDateInput.value);
        } else {
            showToast("لم يتم العثور على سجل راتب للشهر السابق لهذا الموظف.", "info");
        }
    });
    if (DomElements.autoPopulateSalariesButton) DomElements.autoPopulateSalariesButton.addEventListener('click', async () => {
        showModal('confirmationModal', "هل أنت متأكد أنك تريد إعداد رواتب الشهر الجديد تلقائياً لجميع الموظفين؟ سيتم استخدام راتب الشهر السابق لكل موظف.", async () => {
            DomElements.autoPopulateSalariesButton.disabled = true; DomElements.autoPopulateSalariesButton.textContent = "جاري الإعداد...";
            try {
                const today = new Date();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();
                const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
                const payrollPeriodMonthName = ARABIC_MONTHS[currentMonth];
                const currentPayrollPeriod = `${payrollPeriodMonthName} ${currentYear}`;
                let addedCount = 0;
                let updatedCount = 0;
                let skippedCount = 0;

                for (const emp of employees) {
                    // تحقق إذا كان هناك راتب بالفعل لهذا الموظف في الشهر الحالي
                    const existingSalary = salaries.find(sal =>
                        sal.employeeId === parseInt(emp.id) && 
                        new Date(sal.date).getMonth() === currentMonth &&
                        new Date(sal.date).getFullYear() === currentYear
                    );

                    if (existingSalary) {
                        skippedCount++;
                        continue; // تخطي إذا كان الراتب موجوداً
                    }

                    // ابحث عن آخر راتب مدخل لهذا الموظف (يمكن أن يكون من أي شهر سابق)
                    const lastSalary = salaries
                        .filter(sal => sal.employeeId === emp.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .find(() => true); // يجد العنصر الأول بعد الفرز

                    let basic = 0;
                    let allowances = 0;
                    let deductions = 0;
                    let paymentMethod = 'تحويل';

                    if (lastSalary) {
                        basic = lastSalary.basic;
                        allowances = lastSalary.allowances;
                        deductions = lastSalary.deductions;
                        paymentMethod = lastSalary.paymentMethod;
                    } else {
                        // إذا لم يكن هناك راتب سابق، استخدم قيم افتراضية
                        showToast(`لم يتم العثور على راتب سابق للموظف ${emp.name}. سيتم استخدام قيم افتراضية (صفر). يرجى التعديل يدويا.`, "warning", 5000);
                    }

                    const newSalaryData = {
                        employeeId: emp.id,
                        basic: basic,
                        allowances: allowances,
                        deductions: deductions,
                        date: lastDayOfCurrentMonth.toISOString().slice(0, 10),
                        paymentMethod: paymentMethod,
                        payrollPeriod: currentPayrollPeriod
                    };

                    await addSalaryAPI(newSalaryData);
                    addedCount++;
                }
                showToast(`تم إعداد رواتب ${addedCount} موظفاً للشهر الحالي. تم تخطي ${skippedCount} موظفاً (يوجد لهم رواتب بالفعل).`, "success", 7000);
                await loadInitialData();
            } catch (error) {
                showToast(`فشل إعداد الرواتب تلقائياً: ${error.message}`, "error");
            } finally {
                DomElements.autoPopulateSalariesButton.disabled = false;
                DomElements.autoPopulateSalariesButton.textContent = "إعداد رواتب الشهر الجديد تلقائياً";
            }
        });
    });
    if (DomElements.salariesTableSearch) DomElements.salariesTableSearch.addEventListener('input', (e) => renderSalariesTable(e.target.value));
    // New salary table filter event listeners
    if (document.getElementById('filterSalaryEmployeeName')) {
        document.getElementById('filterSalaryEmployeeName').addEventListener('input', () => renderSalariesTable(DomElements.salariesTableSearch.value));
    }
    if (document.getElementById('filterSalaryDate')) {
        document.getElementById('filterSalaryDate').addEventListener('change', () => renderSalariesTable(DomElements.salariesTableSearch.value));
    }
    if (document.getElementById('filterSalaryPaymentMethod')) {
        document.getElementById('filterSalaryPaymentMethod').addEventListener('change', () => renderSalariesTable(DomElements.salariesTableSearch.value));
    }
    if (document.getElementById('filterSalaryPayrollPeriod')) {
        document.getElementById('filterSalaryPayrollPeriod').addEventListener('input', () => renderSalariesTable(DomElements.salariesTableSearch.value));
    }

    if(DomElements.salaryEmployeeSelect) DomElements.salaryEmployeeSelect.addEventListener('change', (e) => checkVacationForSalary(e.target.value, DomElements.salaryDateInput.value));
    if(DomElements.salaryDateInput) DomElements.salaryDateInput.addEventListener('change', (e) => {
        if(DomElements.salaryEmployeeSelect.value) {
            checkVacationForSalary(DomElements.salaryEmployeeSelect.value, e.target.value);
        }
    });


    // Violations Form
    if (DomElements.clearViolationFormButton) DomElements.clearViolationFormButton.addEventListener('click', clearViolationForm);
    if (DomElements.violationForm) DomElements.violationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const violationData = {
            violationNumber: DomElements.violationNumberInput.value.trim(),
            date: DomElements.violationDateInput.value,
            employeeId: parseInt(DomElements.violationEmployeeSelect.value),
            plateNumber: DomElements.plateNumberInput.value.trim(),
            city: DomElements.cityInput.value.trim(),
            amount: parseFloat(DomElements.violationAmountInput.value),
            details: DomElements.violationDetailsInput.value.trim(),
            status: DomElements.violationStatusSelect.value,
            notes: DomElements.violationNotesInput.value.trim()
        };

        if (!violationData.violationNumber || !violationData.date || !violationData.employeeId || isNaN(violationData.amount) || !violationData.details) {
            showToast("يرجى ملء جميع الحقول المطلوبة للمخالفة.", "error");
            return;
        }

        DomElements.saveViolationButton.disabled = true;
        DomElements.saveViolationButton.textContent = currentEditViolationId ? "جاري التحديث..." : "جاري الحفظ...";

        try {
            if (currentEditViolationId) {
                await updateViolationAPI(currentEditViolationId, violationData);
                showToast("تم تحديث المخالفة بنجاح!", "success");
            } else {
                await addViolationAPI(violationData);
                showToast("تمت إضافة المخالفة بنجاح!", "success");
            }
            clearViolationForm();
            await loadInitialData();
        } catch (error) {
            showToast(`فشل حفظ المخالفة: ${error.message}`, "error");
        } finally {
            DomElements.saveViolationButton.disabled = false;
            DomElements.saveViolationButton.textContent = currentEditViolationId ? "تحديث المخالفة" : "حفظ المخالفة";
            if (!currentEditViolationId) DomElements.saveViolationButton.textContent = "حفظ المخالفة";
        }
    });
    if (DomElements.violationsTableSearch) DomElements.violationsTableSearch.addEventListener('input', (e) => renderViolationsTable(e.target.value));
    // New violation table filter event listeners
    if (document.getElementById('filterViolationNumber')) {
        document.getElementById('filterViolationNumber').addEventListener('input', () => renderViolationsTable(DomElements.violationsTableSearch.value));
    }
    if (document.getElementById('filterViolationDate')) {
        document.getElementById('filterViolationDate').addEventListener('change', () => renderViolationsTable(DomElements.violationsTableSearch.value));
    }
    if (document.getElementById('filterViolationEmployeeName')) {
        document.getElementById('filterViolationEmployeeName').addEventListener('input', () => renderViolationsTable(DomElements.violationsTableSearch.value));
    }
    if (document.getElementById('filterViolationPlateNumber')) {
        document.getElementById('filterViolationPlateNumber').addEventListener('input', () => renderViolationsTable(DomElements.violationsTableSearch.value));
    }
    if (document.getElementById('filterViolationCity')) {
        document.getElementById('filterViolationCity').addEventListener('input', () => renderViolationsTable(DomElements.violationsTableSearch.value));
    }
    if (document.getElementById('filterViolationDetails')) {
        document.getElementById('filterViolationDetails').addEventListener('input', () => renderViolationsTable(DomElements.violationsTableSearch.value));
    }
    if (document.getElementById('filterViolationStatus')) {
        document.getElementById('filterViolationStatus').addEventListener('change', () => renderViolationsTable(DomElements.violationsTableSearch.value));
    }


    // Advances Form
    if(DomElements.clearAdvanceFormButton) DomElements.clearAdvanceFormButton.addEventListener('click', clearAdvanceForm);
    if(DomElements.advanceForm) DomElements.advanceForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const employeeId = DomElements.advanceEmployeeSelect.value;
        const date = DomElements.advanceDateInput.value;
        const amount = DomElements.advanceAmountInput.value;
        const reason = DomElements.advanceReasonInput.value.trim();
        const notes = DomElements.advanceNotesInput.value.trim();

        if (!employeeId || !date || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            showToast("يرجى ملء جميع الحقول المطلوبة للسلفة وإدخال مبلغ صحيح وموجب.", "error");
            return;
        }

        const advanceData = {
            employeeId: parseInt(employeeId),
            date,
            amount: parseFloat(amount),
            reason,
            notes
        };

        DomElements.saveAdvanceButton.disabled = true;
        DomElements.saveAdvanceButton.textContent = currentEditAdvanceId ? "جاري التحديث..." : "جاري الإضافة...";

        try {
            if (currentEditAdvanceId) {
                await updateAdvanceAPI(currentEditAdvanceId, advanceData);
                showToast("تم تحديث السلفة بنجاح!", "success");
            } else {
                await addAdvanceAPI(advanceData);
                showToast("تمت إضافة السلفة بنجاح!", "success");
            }
            clearAdvanceForm();
            await loadInitialData();
        } catch (error) {
            showToast(`فشل حفظ السلفة: ${error.message}`, "error");
        } finally {
            DomElements.saveAdvanceButton.disabled = false;
            DomElements.saveAdvanceButton.textContent = currentEditAdvanceId ? "تحديث سلفة" : "إضافة سلفة";
            if(!currentEditAdvanceId) DomElements.saveAdvanceButton.textContent = "إضافة سلفة";
        }
    });
    if(DomElements.partialPaymentForm) DomElements.partialPaymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const advanceId = parseInt(DomElements.partialPaymentAdvanceIdInput.value);
        const amountToPay = parseFloat(DomElements.partialPaymentAmountToPayInput.value);

        if (isNaN(amountToPay) || amountToPay <= 0) {
            showToast("يرجى إدخال مبلغ دفع صحيح وموجب.", "error");
            return;
        }

        const advance = await getFromStore(STORE_ADVANCES, advanceId);
        if (!advance) { showToast("السلفة غير موجودة.", "error"); return; }

        const currentPaidAmount = parseFloat(advance.paidAmount) || 0;
        const totalAdvanceAmount = parseFloat(advance.amount) || 0;
        const newPaidAmount = currentPaidAmount + amountToPay;

        if (newPaidAmount > totalAdvanceAmount) {
            showToast(`المبلغ المراد دفعه (${amountToPay.toFixed(2)}) يتجاوز المبلغ المتبقي (${(totalAdvanceAmount - currentPaidAmount).toFixed(2)}) للسلفة.`, "error");
            return;
        }

        advance.paidAmount = newPaidAmount;
        if (newPaidAmount >= totalAdvanceAmount) {
            advance.status = 'مستوفاة';
            advance.paidAmount = totalAdvanceAmount; // التأكد من أن المبلغ المدفوع لا يتجاوز الإجمالي
        } else if (newPaidAmount > 0) {
            advance.status = 'مدفوع جزئياً';
        } else {
            advance.status = 'مستحقة';
        }

        try {
            await putIntoStore(STORE_ADVANCES, advance);
            showToast("تم تسجيل الدفعة بنجاح!", "success");
            closeModal('partialPaymentModal');
            await loadInitialData();
        } catch (error) {
            showToast(`فشل تسجيل الدفعة: ${error.message}`, "error");
        }
    });
    if (DomElements.advancesTableSearch) DomElements.advancesTableSearch.addEventListener('input', (e) => renderAdvancesTable(e.target.value));
    // New advance table filter event listeners
    if (document.getElementById('filterAdvanceEmployeeName')) {
        document.getElementById('filterAdvanceEmployeeName').addEventListener('input', () => renderAdvancesTable(DomElements.advancesTableSearch.value));
    }
    if (document.getElementById('filterAdvanceDate')) {
        document.getElementById('filterAdvanceDate').addEventListener('change', () => renderAdvancesTable(DomElements.advancesTableSearch.value));
    }
    if (document.getElementById('filterAdvanceReason')) {
        document.getElementById('filterAdvanceReason').addEventListener('input', () => renderAdvancesTable(DomElements.advancesTableSearch.value));
    }
    if (document.getElementById('filterAdvanceStatus')) {
        document.getElementById('filterAdvanceStatus').addEventListener('change', () => renderAdvancesTable(DomElements.advancesTableSearch.value));
    }


    if (DomElements.residencyExpiryTableSearch) DomElements.residencyExpiryTableSearch.addEventListener('input', (e) => renderResidencyExpiryTable(e.target.value));
    if (DomElements.carAssignmentsTableSearch) DomElements.carAssignmentsTableSearch.addEventListener('input', (e) => renderCarAssignmentsTable(e.target.value));

    // Vacation Form
    if(DomElements.clearVacationFormButton) DomElements.clearVacationFormButton.addEventListener('click', clearVacationForm);
    if(DomElements.vacationForm) DomElements.vacationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const employeeIdSelected = DomElements.vacationEmployeeSelect.value;
        const vacationData = {
            employeeId: parseInt(employeeIdSelected),
            vacationType: DomElements.vacationTypeSelect.value,
            vacationStartDate: DomElements.vacationStartDateInput.value,
            vacationEndDate: DomElements.vacationEndDateInput.value,
            notes: DomElements.vacationNotesInput.value.trim()
        };

        if (!employeeIdSelected || !vacationData.vacationType || !vacationData.vacationStartDate || !vacationData.vacationEndDate) {
            showToast("يرجى ملء جميع الحقول المطلوبة للإجازة (الموظف، النوع، تاريخ البدء، تاريخ الانتهاء).", "error");
            return;
        }
        if (new Date(vacationData.vacationEndDate) < new Date(vacationData.vacationStartDate)) {
            showToast("تاريخ انتهاء الإجازة لا يمكن أن يكون قبل تاريخ البدء.", "error");
            return;
        }

        DomElements.saveVacationButton.disabled = true;
        DomElements.saveVacationButton.textContent = currentEditVacationId ? "جاري التحديث..." : "جاري الحفظ...";

        try {
            if (currentEditVacationId) {
                await updateVacationAPI(currentEditVacationId, vacationData);
                showToast("تم تحديث الإجازة بنجاح!", "success");
            } else {
                await addVacationAPI(vacationData);
                showToast("تمت إضافة الإجازة بنجاح!", "success");
            }
            clearVacationForm();
            await loadInitialData();
        } catch (error) {
            showToast(`فشل حفظ الإجازة: ${error.message}`, "error");
        } finally {
            DomElements.saveVacationButton.disabled = false;
            DomElements.saveVacationButton.textContent = currentEditVacationId ? "تحديث الإجازة" : "حفظ الإجازة";
            if(!currentEditVacationId) DomElements.saveVacationButton.textContent = "حفظ الإجازة";
        }
    });
    if(DomElements.vacationsTableSearch) DomElements.vacationsTableSearch.addEventListener('input', (e) => renderVacationsTable(e.target.value));
    // New vacation table filter event listeners
    if (document.getElementById('filterVacationEmployeeName')) {
        document.getElementById('filterVacationEmployeeName').addEventListener('input', () => renderVacationsTable(DomElements.vacationsTableSearch.value));
    }
    if (document.getElementById('filterVacationType')) {
        document.getElementById('filterVacationType').addEventListener('change', () => renderVacationsTable(DomElements.vacationsTableSearch.value));
    }
    if (document.getElementById('filterVacationStartDate')) {
        document.getElementById('filterVacationStartDate').addEventListener('change', () => renderVacationsTable(DomElements.vacationsTableSearch.value));
    }
    if (document.getElementById('filterVacationEndDate')) {
        document.getElementById('filterVacationEndDate').addEventListener('change', () => renderVacationsTable(DomElements.vacationsTableSearch.value));
    }
    if (document.getElementById('filterVacationStatus')) {
        document.getElementById('filterVacationStatus').addEventListener('change', () => renderVacationsTable(DomElements.vacationsTableSearch.value));
    }


    // Dashboard Year Select
    if (DomElements.dashboardYearSelect) DomElements.dashboardYearSelect.addEventListener('change', (e) => renderAnnualSalarySummary(e.target.value));

    // Reports Year/Month Selects & Custom Report Type
    // ⭐ تأكد من أن هذه المستمعات للأحداث تعمل بشكل سليم
    if (DomElements.reportYearSelect) DomElements.reportYearSelect.addEventListener('change', (e) => populateReportMonths(DomElements.reportMonthSelect, e.target.value));
    if (DomElements.customReportYearSelect) DomElements.customReportYearSelect.addEventListener('change', (e) => populateReportMonths(DomElements.customReportMonthSelect, e.target.value));
    if (DomElements.customReportTypeSelect) {
        DomElements.customReportTypeSelect.addEventListener('change', () => {
            if (DomElements.customReportVacationStatusDiv) {
                DomElements.customReportVacationStatusDiv.style.display = DomElements.customReportTypeSelect.value === 'vacationReport' ? 'block' : 'none';
            }
        });
         // Trigger change on load to set initial visibility if vacationReport is default
        if (DomElements.customReportVacationStatusDiv && DomElements.customReportTypeSelect.value === 'vacationReport') {
            DomElements.customReportVacationStatusDiv.style.display = 'block';
        }
    }


    // Generate Standard Report Button
    // ⭐ تأكد من أن هذا المستمع للأحداث يعمل بشكل سليم
    if (DomElements.generateStandardReportButton) DomElements.generateStandardReportButton.addEventListener('click', () => {
        const year = DomElements.reportYearSelect.value;
        const month = DomElements.reportMonthSelect.value; // "all" or "MM"

        if (!year) {
            showToast("يرجى اختيار سنة لإنشاء التقرير.", "error");
            return;
        }

        // بما أنك ذكرت أن هذا الزر خاص بـ "Standard Report"،
        // فافترض أن هذا يعني "ملخص شهري" أو "ملخص سنوي"
        // أو ربما تقرير رواتب شهري مفصل بدون فلاتر معقدة
        // هنا يمكنك تحديد نوع التقرير الذي تريد إنشاءه لهذا الزر
        // على سبيل المثال:
        if (month === "all") {
             handleGenerateCustomReport(
                'yearlySummary',
                0, // All employees
                0, // All categories
                'all', // N/A for this report type
                year,
                'all', // N/A for yearly summary
                null, // No start date
                null, // No end date
                DomElements.reportOutput,
                DomElements.exportButtonsContainer
             );
        } else {
             handleGenerateCustomReport(
                'detailedMonthlySalary',
                0, // All employees
                0, // All categories
                'all', // N/A for this report type
                year,
                month,
                null, // No start date
                null, // No end date
                DomElements.reportOutput,
                DomElements.exportButtonsContainer
             );
        }
    });

    // Generate Custom Report Button
    // ⭐ تأكد من أن هذا المستمع للأحداث يعمل بشكل سليم
    if (DomElements.generateCustomReportButton) DomElements.generateCustomReportButton.addEventListener('click', () => {
        const reportType = DomElements.customReportTypeSelect.value;
        const selectedEmployeeId = parseInt(DomElements.customReportEmployeeSelect.value);
        const selectedCategoryId = parseInt(DomElements.customReportCategorySelect.value);
        const selectedAdvanceStatus = DomElements.customReportAdvanceStatusSelect.value;
        const selectedVacationStatus = DomElements.customReportVacationStatusSelect.value; // ⭐ فلتر الإجازات
        const selectedYear = DomElements.customReportYearSelect.value;
        const selectedMonth = DomElements.customReportMonthSelect.value; // "all" أو "MM"
        const startDateStr = DomElements.customReportStartDateInput.value;
        const endDateStr = DomElements.customReportEndDateInput.value;

        // بعض التحققات الأساسية قبل إنشاء التقرير
        if (reportType === 'salarySlip' && selectedEmployeeId === 0) {
            showToast("يرجى اختيار موظف محدد لكشف الراتب المفصل.", "error");
            return;
        }
        if ((reportType === 'salarySlip' || reportType === 'detailedMonthlySalary') && (selectedMonth === "all" || !selectedYear)) {
            showToast("يرجى اختيار سنة وشهر محددين لتقرير الرواتب.", "error");
            return;
        }
        if ((startDateStr && !endDateStr) || (!startDateStr && endDateStr)) {
            showToast("يرجى إدخال كلا تاريخي البدء والانتهاء أو تركهما فارغين.", "error");
            return;
        }
        if (startDateStr && endDateStr && new Date(startDateStr) > new Date(endDateStr)) {
            showToast("تاريخ البدء لا يمكن أن يكون بعد تاريخ الانتهاء.", "error");
            return;
        }

        handleGenerateCustomReport(
            reportType,
            selectedEmployeeId,
            selectedCategoryId,
            selectedAdvanceStatus,
            selectedYear,
            selectedMonth,
            startDateStr,
            endDateStr,
            DomElements.reportOutput,
            DomElements.exportButtonsContainer,
            selectedVacationStatus // ⭐ تمرير حالة الإجازة المحددة
        );
    });

    // Export Excel Button
    if (DomElements.exportExcelButton) DomElements.exportExcelButton.addEventListener('click', () => {
        const currentReportType = DomElements.customReportTypeSelect.value;
        let tableIdToExport = '';
        let fileName = 'تقرير_بيانات_مؤسسة_فهد_ضاوي_الحربي';

        // تحديد معرف الجدول بناءً على نوع التقرير
        // هذا الجزء يفترض أن دوال generate...ReportLogic تنشئ جدولاً بمعرف محدد
        // وإلا، ستحتاج إلى تحديد العنصر الذي يحتوي على بيانات التقرير (مثل div#reportOutput)
        // واقتطاع الجدول منه.
        switch (currentReportType) {
            case 'salarySlip':
                showToast("كشف الراتب المفصل (Slip) غير مناسب للتصدير كجدول Excel مباشر. يرجى استخدام PDF.", "info");
                return;
            case 'detailedMonthlySalary':
                tableIdToExport = 'detailedMonthlySalaryReportTable';
                fileName += '_رواتب_شهرية_مفصلة';
                break;
            case 'violationReport':
                tableIdToExport = 'violationReportTable';
                fileName += '_مخالفات';
                break;
            case 'residencyExpiryReport':
                tableIdToExport = 'residencyExpiryReportTable';
                fileName += '_انتهاء_اقامة';
                break;
            case 'advanceReport':
                tableIdToExport = 'advanceReportTable';
                fileName += '_سلف';
                break;
            case 'vacationReport': // ⭐ حالة تصدير تقرير الإجازات
                tableIdToExport = 'vacationReportTable';
                fileName += '_اجازات';
                break;
            case 'monthlySummary':
                tableIdToExport = 'monthlySummaryReportTable';
                fileName += '_ملخص_رواتب_شهري';
                break;
            case 'yearlySummary':
                tableIdToExport = 'yearlySummaryReportTable';
                fileName += '_ملخص_رواتب_سنوي';
                break;
            case 'comprehensiveData':
                 // للتقرير الشامل، يمكن أن يكون هناك عدة جداول.
                 // يمكنك التفكير في جمع البيانات من جميع الجداول أو تصدير العنصر الرئيسي للتقرير.
                 // حاليا، لنقم بتصدير النص الكامل
                showToast("التقرير الشامل قد يكون معقداً للتصدير التلقائي إلى Excel. يرجى تجربة PDF أو نسخ المحتوى يدوياً.", "info");
                return;
            default:
                showToast("لا يمكن تصدير هذا النوع من التقارير إلى Excel.", "error");
                return;
        }

        // إذا كان نوع التقرير ينتج جدولاً واحداً
        if (tableIdToExport) {
            const tableElement = document.getElementById(tableIdToExport);
            if (tableElement) {
                exportTableToExcel(tableIdToExport, fileName);
            } else {
                showToast("لم يتم العثور على جدول التقرير للتصدير إلى Excel.", "error");
            }
        } else {
            showToast("لا يوجد جدول محدد للتصدير.", "error");
        }
    });

    // Export PDF Button
    if (DomElements.exportPdfButton) DomElements.exportPdfButton.addEventListener('click', async () => {
        if (!DomElements.reportOutput) {
            showToast("لا يوجد تقرير لعرضه للتصدير كـ PDF.", "error");
            return;
        }
        const currentReportType = DomElements.customReportTypeSelect.value;
        let fileName = 'تقرير_بيانات_مؤسسة_فهد_ضاوي_الحربي';

        switch (currentReportType) {
            case 'salarySlip':
                fileName += '_كشف_راتب';
                break;
            case 'detailedMonthlySalary':
                fileName += '_رواتب_شهرية_مفصلة';
                break;
            case 'violationReport':
                fileName += '_مخالفات';
                break;
            case 'residencyExpiryReport':
                fileName += '_انتهاء_اقامة';
                break;
            case 'advanceReport':
                fileName += '_سلف';
                break;
            case 'vacationReport': // ⭐ حالة تصدير تقرير الإجازات
                fileName += '_اجازات';
                break;
            case 'monthlySummary':
                fileName += '_ملخص_رواتب_شهري';
                break;
            case 'yearlySummary':
                fileName += '_ملخص_رواتب_سنوي';
                break;
            case 'comprehensiveData':
                fileName += '_تقرير_شامل';
                break;
            default:
                fileName += '_تقرير';
                break;
        }
        await exportContentToPdf('reportOutput', fileName);
    });

    // Backup & Restore Buttons
    if (DomElements.backupDataButton) DomElements.backupDataButton.addEventListener('click', async () => {
        showModal('confirmationModal', "هل أنت متأكد أنك تريد إنشاء نسخة احتياطية من جميع البيانات؟", async () => {
            try {
                const backupData = {
                    categories: await getAllFromStore(STORE_CATEGORIES), //
                    employees: await getAllFromStore(STORE_EMPLOYEES), //
                    salaries: await getAllFromStore(STORE_SALARIES), //
                    violations: await getAllFromStore(STORE_VIOLATIONS), //
                    advances: await getAllFromStore(STORE_ADVANCES), //
                    vacations: await getAllFromStore(STORE_VACATIONS) // ⭐ تضمين الإجازات
                };
                const filename = `salary_management_backup_${new Date().toISOString().slice(0, 10)}.json`; //
                await downloadJson(backupData, filename); //
            } catch (error) {
                showToast(`فشل إنشاء النسخة الاحتياطية: ${error.message}`, "error"); //
            }
        });
    });
    if (DomElements.restoreDataButton) DomElements.restoreDataButton.addEventListener('click', () => {
        showModal('confirmationModal', "هل أنت متأكد أنك تريد استعادة البيانات من ملف؟ هذا سيقوم بمسح البيانات الحالية واستبدالها.", () => {
            DomElements.restoreFileInput.click();
        });
    });
    if (DomElements.restoreFileInput) DomElements.restoreFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const backupData = JSON.parse(e.target.result); //
                    if (!backupData.categories || !backupData.employees || !backupData.salaries || !backupData.violations || !backupData.advances || !backupData.vacations) { // ⭐ التحقق من جميع المخازن
                        showToast("الملف المحدد ليس ملف نسخة احتياطية صحيح للنظام.", "error"); //
                        return;
                    }
                    await restoreData(backupData); //
                    // مسح قيمة input type="file" للسماح بتحميل نفس الملف مرة أخرى إذا لزم الأمر
                    event.target.value = '';
                } catch (error) {
                    showToast(`خطأ في قراءة ملف النسخة الاحتياطية أو تنسيقه: ${error.message}`, "error"); //
                    console.error("Error parsing or restoring backup file:", error); //
                }
            };
            reader.readAsText(file); //
        }
    });

    // Table Header Sorting
    document.querySelectorAll('table').forEach(table => {
        const tableId = table.id;
        const thead = table.querySelector('thead');
        if (thead) {
            thead.addEventListener('click', (e) => {
                const th = e.target.closest('th[data-sort-key]');
                if (th) {
                    const columnKey = th.getAttribute('data-sort-key');
                    if (columnKey) {
                        sortTable(tableId, columnKey);
                    }
                }
            });
        }
    });

    // Event Delegation for action buttons in tables
    const tableBodiesConfigs = [
        { body: DomElements.categoriesTableBody, editClass: 'edit-category-btn', deleteClass: 'delete-category-btn', editFn: editCategory, deleteFn: confirmDeleteCategory, nameAttr: 'data-name' },
        { body: DomElements.employeesTableBody, editClass: 'edit-employee-btn', deleteClass: 'delete-employee-btn', editFn: editEmployee, deleteFn: confirmDeleteEmployee, nameAttr: 'data-name' },
        { body: DomElements.salariesTableBody, editClass: 'edit-salary-btn', deleteClass: 'delete-salary-btn', editFn: editSalary, deleteFn: confirmDeleteSalary, nameAttr: 'data-empname', dateAttr: 'data-date' },
        { body: DomElements.violationsTableBody, editClass: 'edit-violation-btn', deleteClass: 'delete-violation-btn', editFn: editViolation, deleteFn: confirmDeleteViolation, nameAttr: 'data-empname', dateAttr: 'data-date' },
        { body: DomElements.advancesTableBody, editClass: 'edit-advance-btn', deleteClass: 'delete-advance-btn', editFn: editAdvance, deleteFn: confirmDeleteAdvance, nameAttr: 'data-empname', dateAttr: 'data-date', partialPaymentClass: 'partial-payment-btn', settleClass: 'settle-advance-btn' },
        { body: DomElements.vacationsTableBody, editClass: 'edit-vacation-btn', deleteClass: 'delete-vacation-btn', editFn: editVacation, deleteFn: confirmDeleteVacation, nameAttr: 'data-empname', dateAttr: 'data-startdate' }
    ];

    tableBodiesConfigs.forEach(config => {
        if (config.body) {
            config.body.addEventListener('click', (e) => {
                console.log(`Click detected in table body for ${config.body.closest('table') ? config.body.closest('table').id : 'UNKNOWN_TABLE'}. Target:`, e.target);

                const editButton = e.target.closest(`.${config.editClass}`);
                const deleteButton = e.target.closest(`.${config.deleteClass}`);

                if (editButton) {
                    console.log(`Edit button identified for ${config.editClass}. ID:`, editButton.dataset.id);
                    if (typeof config.editFn === 'function') {
                        config.editFn(parseInt(editButton.dataset.id));
                    } else {
                        console.error("Edit function is not defined for", config.editClass);
                    }
                } else if (deleteButton) {
                    console.log(`Delete button identified for ${config.deleteClass}. ID:`, deleteButton.dataset.id);
                    const name = deleteButton.getAttribute(config.nameAttr) || 'العنصر';
                    const date = config.dateAttr ? deleteButton.getAttribute(config.dateAttr) : null;
                    if (typeof config.deleteFn === 'function') {
                        if (date) {
                            config.deleteFn(parseInt(deleteButton.dataset.id), name, date);
                        } else {
                            config.deleteFn(parseInt(deleteButton.dataset.id), name);
                        }
                    } else {
                        console.error("Delete function is not defined for", config.deleteClass);
                    }
                } else if (config.partialPaymentClass && e.target.closest(`.${config.partialPaymentClass}`)) {
                    const partialButton = e.target.closest(`.${config.partialPaymentClass}`);
                    console.log(`Partial payment button identified. ID:`, partialButton.dataset.id);
                    if (typeof showPartialPaymentModal === 'function') {
                        showPartialPaymentModal(parseInt(partialButton.dataset.id));
                    }
                } else if (config.settleClass && e.target.closest(`.${config.settleClass}`)) {
                    const settleButton = e.target.closest(`.${config.settleClass}`);
                    console.log(`Settle advance button identified. ID:`, settleButton.dataset.id);
                    if (typeof settleAdvance === 'function') {
                        settleAdvance(parseInt(settleButton.dataset.id));
                    }
                } else {
                     // console.log("Clicked element is not a recognized action button in this table section.");
                }
            });
        } else {
            // console.warn(`Table body for one of the configurations is null. Edit/Delete might not work for that table.`);
        }
    });

    // Add event listener for the logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});