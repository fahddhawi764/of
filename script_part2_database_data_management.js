// script_part2_database_data_management.js

// ملاحظة: المتغيرات مثل DB_NAME, DB_VERSION, STORE_CATEGORIES, db, categories, employees, etc.
// يفترض أنها معرفة عالميًا في script_part1_setup.js ويتم الوصول إليها هنا.

/**
 * Opens the IndexedDB database, creating or upgrading object stores as needed.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
function openDB() {
    return new Promise((resolve, reject) => {
        // DB_NAME و DB_VERSION يتم الوصول إليهما من النطاق العام (معرفة في script_part1_setup.js)
        const request = indexedDB.open(DB_NAME, DB_VERSION); // تأكد أن DB_VERSION هو 10 أو أعلى

        request.onupgradeneeded = (event) => {
            // 'db' هو المتغير العام المعرف في script_part1_setup.js
            db = event.target.result;
            console.log(`[IndexedDB Setup] Upgrading database to version ${DB_VERSION}. Old version was ${event.oldVersion}`); //

            // Categories Store
            if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
                db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id', autoIncrement: true }); //
                console.log(`[IndexedDB Setup] Object store ${STORE_CATEGORIES} created.`);
            }

            // Employees Store
            if (!db.objectStoreNames.contains(STORE_EMPLOYEES)) {
                const employeeStore = db.createObjectStore(STORE_EMPLOYEES, { keyPath: 'id', autoIncrement: true }); //
                employeeStore.createIndex('categoryId', 'categoryId', { unique: false }); //
                employeeStore.createIndex('carNumber', 'carNumber', { unique: false }); //
                employeeStore.createIndex('idIssuanceNumber', 'idIssuanceNumber', { unique: false }); //
                console.log(`[IndexedDB Setup] Object store ${STORE_EMPLOYEES} created with indexes.`);
            } else if (event.oldVersion < 7) { //
                const transaction = event.currentTarget.transaction;
                const employeeStore = transaction.objectStore(STORE_EMPLOYEES);
                if (!employeeStore.indexNames.contains('carNumber')) {
                    employeeStore.createIndex('carNumber', 'carNumber', { unique: false }); //
                }
                if (!employeeStore.indexNames.contains('idIssuanceNumber')) {
                    employeeStore.createIndex('idIssuanceNumber', 'idIssuanceNumber', { unique: false }); //
                }
                console.log(`[IndexedDB Setup] Object store ${STORE_EMPLOYEES} upgraded for version < 7.`);
            }

            // Salaries Store
            if (!db.objectStoreNames.contains(STORE_SALARIES)) {
                const salaryStore = db.createObjectStore(STORE_SALARIES, { keyPath: 'id', autoIncrement: true }); //
                salaryStore.createIndex('employeeId', 'employeeId', { unique: false }); //
                salaryStore.createIndex('date', 'date', { unique: false }); //
                salaryStore.createIndex('employeeIdAndDate', ['employeeId', 'date'], { unique: false }); //
                salaryStore.createIndex('payrollPeriod', 'payrollPeriod', { unique: false }); //
                console.log(`[IndexedDB Setup] Object store ${STORE_SALARIES} created with indexes.`);
            } else if (event.oldVersion < 7) { //
                const transaction = event.currentTarget.transaction;
                const salaryStore = transaction.objectStore(STORE_SALARIES);
                if (!salaryStore.indexNames.contains('payrollPeriod')) {
                    salaryStore.createIndex('payrollPeriod', 'payrollPeriod', { unique: false }); //
                }
                console.log(`[IndexedDB Setup] Object store ${STORE_SALARIES} upgraded for version < 7.`);
            }

            // Violations Store
            if (!db.objectStoreNames.contains(STORE_VIOLATIONS)) {
                const violationStore = db.createObjectStore(STORE_VIOLATIONS, { keyPath: 'id', autoIncrement: true }); //
                violationStore.createIndex('employeeId', 'employeeId', { unique: false }); //
                violationStore.createIndex('date', 'date', { unique: false }); //
                violationStore.createIndex('violationNumber', 'violationNumber', { unique: false }); //
                violationStore.createIndex('employeeIdAndDate', ['employeeId', 'date'], { unique: false }); //
                console.log(`[IndexedDB Setup] Object store ${STORE_VIOLATIONS} created with indexes.`);
            }

            // Advances Store
            let advanceStore;
            if (!db.objectStoreNames.contains(STORE_ADVANCES)) {
                advanceStore = db.createObjectStore(STORE_ADVANCES, { keyPath: 'id', autoIncrement: true }); //
                advanceStore.createIndex('employeeId', 'employeeId', { unique: false }); //
                advanceStore.createIndex('date', 'date', { unique: false }); //
                advanceStore.createIndex('status', 'status', { unique: false }); //
                console.log(`[IndexedDB Setup] Object store ${STORE_ADVANCES} created with indexes.`);
            } else {
                 advanceStore = event.currentTarget.transaction.objectStore(STORE_ADVANCES); //
            }

            if (event.oldVersion < 9) { //
                // Migration for Advances store (as in your provided code)
                console.log(`[IndexedDB Migration] Upgrading ${STORE_ADVANCES} store schema from version ${event.oldVersion} to ${DB_VERSION}`); //
                if (!advanceStore.indexNames.contains('status')) {
                     advanceStore.createIndex('status', 'status', { unique: false }); //
                     console.log(`[IndexedDB Migration] Index 'status' created for ${STORE_ADVANCES}.`); //
                }
                const cursorRequest = advanceStore.openCursor(); //
                cursorRequest.onsuccess = e => { //
                    const cursor = e.target.result;
                    if (cursor) { //
                        const data = cursor.value;
                        let needsUpdate = false;

                        if (typeof data.paidAmount === 'undefined') { //
                            if (data.status === 'مستوفاة') { //
                                data.paidAmount = parseFloat(data.amount) || 0; //
                            } else {
                                data.paidAmount = 0; //
                            }
                            needsUpdate = true; //
                            console.log(`[IndexedDB Migration] Advance ID ${data.id}: Initialized paidAmount to ${data.paidAmount}`); //
                        }

                        data.paidAmount = parseFloat(data.paidAmount) || 0; //
                        data.amount = parseFloat(data.amount) || 0; //

                        const oldStatus = data.status;
                        if (data.paidAmount >= data.amount && data.amount > 0) { //
                            data.status = 'مستوفاة'; //
                            data.paidAmount = data.amount; //
                        } else if (data.paidAmount > 0 && data.paidAmount < data.amount) { //
                            data.status = 'مدفوع جزئياً'; //
                        } else {
                            data.status = 'مستحقة'; //
                            if (data.paidAmount < 0) data.paidAmount = 0; //
                        }

                        if(oldStatus !== data.status) { //
                            needsUpdate = true; //
                            console.log(`[IndexedDB Migration] Advance ID ${data.id}: Status changed from ${oldStatus} to ${data.status}`); //
                        }

                        if(needsUpdate) { //
                            try {
                                cursor.update(data); //
                            } catch (updateError) {
                                console.error(`[IndexedDB Migration] Error updating advance ID ${data.id} during migration:`, updateError); //
                            }
                        }
                        cursor.continue(); //
                    } else {
                        console.log(`[IndexedDB Migration] ${STORE_ADVANCES} store schema migration to version 9 complete.`); //
                    }
                };
                cursorRequest.onerror = e => { //
                    console.error(`[IndexedDB Migration] Error during cursor request for ${STORE_ADVANCES} schema migration to version 9:`, e.target.error); //
                };
            }

            // ⭐ Vacations Store
            if (!db.objectStoreNames.contains(STORE_VACATIONS)) {
                const vacationStore = db.createObjectStore(STORE_VACATIONS, { keyPath: 'id', autoIncrement: true }); //
                vacationStore.createIndex('employeeId', 'employeeId', { unique: false });
                vacationStore.createIndex('vacationType', 'vacationType', { unique: false });
                vacationStore.createIndex('vacationStartDate', 'vacationStartDate', { unique: false });
                vacationStore.createIndex('vacationEndDate', 'vacationEndDate', { unique: false });
                vacationStore.createIndex('employeeIdAndEndDate', ['employeeId', 'vacationEndDate'], { unique: false });
                console.log(`[IndexedDB Setup] Object store ${STORE_VACATIONS} created with indexes.`);
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result; //  تعيين قيمة لمتغير db العام
            console.log('[IndexedDB] IndexedDB opened successfully.'); //
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('[IndexedDB] IndexedDB error:', event.target.errorCode, event.target.error); //
            reject(new Error('IndexedDB error: ' + event.target.error));
        };
    });
}

/**
 * Gets an object store from the IndexedDB database.
 * @param {string} storeName - The name of the object store.
 * @param {IDBTransactionMode} mode - The transaction mode ('readonly' or 'readwrite').
 * @returns {IDBObjectStore} The object store instance.
 */
function getObjectStore(storeName, mode) {
    if (!db) { //  التحقق من متغير db العام
        console.error("[IndexedDB] Database not initialized. Call openDB() first."); //
        throw new Error("Database not initialized.");
    }
    const transaction = db.transaction([storeName], mode); //
    return transaction.objectStore(storeName); //
}

/**
 * Retrieves all records from a specified object store.
 * @param {string} storeName - The name of the object store.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of all records.
 */
async function getAllFromStore(storeName) {
    const store = getObjectStore(storeName, 'readonly'); //
    const request = store.getAll(); //
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result); //
        request.onerror = (event) => {
            console.error(`[IndexedDB] Error fetching all from ${storeName}:`, event.target.error); //
            reject(request.error);
        };
    });
}

/**
 * Retrieves a single record from a specified object store by its ID.
 * @param {string} storeName - The name of the object store.
 * @param {number} id - The ID of the record to retrieve.
 * @returns {Promise<Object|undefined>} A promise that resolves with the record or undefined if not found.
 */
async function getFromStore(storeName, id) {
    const store = getObjectStore(storeName, 'readonly'); //
    const request = store.get(id); //
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result); //
        request.onerror = (event) => {
            console.error(`[IndexedDB] Error fetching ID ${id} from ${storeName}:`, event.target.error); //
            reject(request.error);
        };
    });
}

/**
 * Adds or updates a record in a specified object store.
 * @param {string} storeName - The name of the object store.
 * @param {Object} data - The data object to add or update.
 * @returns {Promise<number>} A promise that resolves with the ID of the added/updated record.
 */
async function putIntoStore(storeName, data) {
    const store = getObjectStore(storeName, 'readwrite'); //
    const request = store.put(data); //
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result); //
        request.onerror = (event) => {
            console.error(`[IndexedDB] Error putting data into ${storeName}:`, event.target.error, data); //
            reject(request.error);
        };
    });
}

/**
 * Deletes a record from a specified object store by its ID.
 * @param {string} storeName - The name of the object store.
 * @param {number} id - The ID of the record to delete.
 * @returns {Promise<void>} A promise that resolves when the record is deleted.
 */
async function deleteFromStore(storeName, id) {
    const store = getObjectStore(storeName, 'readwrite'); //
    const request = store.delete(id); //
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(); //
        request.onerror = (event) => {
            console.error(`[IndexedDB] Error deleting ID ${id} from ${storeName}:`, event.target.error); //
            reject(request.error);
        };
    });
}

// --- API Interaction Functions (Now using IndexedDB) ---

// Categories API
async function fetchCategoriesAPI() {
    console.log("[API] Fetching categories from IndexedDB..."); //
    categories = await getAllFromStore(STORE_CATEGORIES); //
    return categories;
}
async function addCategoryAPI(name) {
    const newCategory = { name: name }; //
    const id = await putIntoStore(STORE_CATEGORIES, newCategory); //
    return { ...newCategory, id: id };
}
async function updateCategoryAPI(id, name) {
    const category = await getFromStore(STORE_CATEGORIES, id); //
    if (!category) throw new Error("Category not found."); //
    category.name = name; //
    await putIntoStore(STORE_CATEGORIES, category); //
    return category;
}
async function deleteCategoryAPI(id) {
    await deleteFromStore(STORE_CATEGORIES, id); //
}

// Employees API
async function fetchEmployeesAPI() {
    console.log("[API] Fetching employees from IndexedDB..."); //
    const rawEmployees = await getAllFromStore(STORE_EMPLOYEES); //
    if (categories.length === 0) await fetchCategoriesAPI(); //
    employees = rawEmployees.map(emp => { //
        const cat = categories.find(c => c.id === emp.categoryId); //
        return {
            ...emp,
            categoryName: cat ? cat.name : "غير محدد", //
            dateOfBirth: emp.dateOfBirth || '', //
            idNumber: emp.idNumber || '', //
            idExpiryDate: emp.idExpiryDate || '', //
            idIssuanceNumber: emp.idIssuanceNumber || '', //
            companyName: emp.companyName || '', //
            companyId: emp.companyId || '', //
            carNumber: emp.carNumber || '' //
        };
    });
    return employees;
}
async function addEmployeeAPI(employeeData) {
    const id = await putIntoStore(STORE_EMPLOYEES, employeeData); //
    const category = categories.find(c => c.id === parseInt(employeeData.categoryId)); //
    return {
        ...employeeData,
        id: id,
        categoryName: category ? category.name : "غير محدد" //
    };
}
async function updateEmployeeAPI(id, employeeData) {
    const existingEmployee = await getFromStore(STORE_EMPLOYEES, id); //
    if (!existingEmployee) throw new Error("Employee not found."); //
    const updatedEmployee = { ...existingEmployee, ...employeeData, categoryId: parseInt(employeeData.categoryId) }; //
    await putIntoStore(STORE_EMPLOYEES, updatedEmployee); //
    const category = categories.find(c => c.id === updatedEmployee.categoryId); //
    return { ...updatedEmployee, categoryName: category ? category.name : "غير محدد" }; //
}
async function deleteEmployeeAPI(id) {
    // يجب حذف جميع السجلات المرتبطة بالموظف أولاً
    const employeeSalaries = salaries.filter(s => s.employeeId === id); //
    for (const salary of employeeSalaries) await deleteFromStore(STORE_SALARIES, salary.id); //

    const employeeViolations = violations.filter(v => v.employeeId === id); //
    for (const violation of employeeViolations) await deleteFromStore(STORE_VIOLATIONS, violation.id); //

    const employeeAdvances = advances.filter(a => a.employeeId === id); //
    for (const advance of employeeAdvances) await deleteFromStore(STORE_ADVANCES, advance.id); //

    // ⭐ حذف سجلات الإجازات المرتبطة بالموظف
    const employeeVacations = vacations.filter(vac => vac.employeeId === id);
    for (const vacation of employeeVacations) await deleteFromStore(STORE_VACATIONS, vacation.id);

    await deleteFromStore(STORE_EMPLOYEES, id); //
}

// Salaries API
async function fetchSalariesAPI() {
    console.log("[API] Fetching salaries from IndexedDB..."); //
    const rawSalaries = await getAllFromStore(STORE_SALARIES); //
    if (employees.length === 0) await fetchEmployeesAPI(); //
    salaries = rawSalaries.map(sal => { //
        const emp = employees.find(e => e.id === sal.employeeId); //
        const basic = parseFloat(sal.basic) || 0; //
        const allowances = parseFloat(sal.allowances) || 0; //
        const deductions = parseFloat(sal.deductions) || 0; //
        return {
            ...sal,
            employeeName: emp ? emp.name : "غير معروف", //
            basic: basic, allowances: allowances, deductions: deductions, //
            total: basic + allowances - deductions, //
            paymentMethod: sal.paymentMethod || 'غير محدد', //
            payrollPeriod: sal.payrollPeriod || '' //
        };
    });
    return salaries;
}
async function addSalaryAPI(salaryData) {
    const id = await putIntoStore(STORE_SALARIES, salaryData); //
    const employee = employees.find(e => e.id === parseInt(salaryData.employeeId)); //
    const basic = parseFloat(salaryData.basic); const allowances = parseFloat(salaryData.allowances); const deductions = parseFloat(salaryData.deductions); //
    const newSalary = { ...salaryData, id: id, employeeId: parseInt(salaryData.employeeId), employeeName: employee ? employee.name : "غير معروف", basic: basic, allowances: allowances, deductions: deductions, paymentMethod: salaryData.paymentMethod, payrollPeriod: salaryData.payrollPeriod || '' }; //
    newSalary.total = newSalary.basic + newSalary.allowances - newSalary.deductions; //
    return newSalary;
}
async function updateSalaryAPI(id, salaryData) {
    const existingSalary = await getFromStore(STORE_SALARIES, id); //
    if (!existingSalary) throw new Error("Salary record not found."); //
    const employee = employees.find(e => e.id === parseInt(salaryData.employeeId)); //
    const basic = parseFloat(salaryData.basic); const allowances = parseFloat(salaryData.allowances); const deductions = parseFloat(salaryData.deductions); //
    const updatedSalary = { ...existingSalary, ...salaryData, employeeId: parseInt(salaryData.employeeId), employeeName: employee ? employee.name : "غير معروف", basic: basic, allowances: allowances, deductions: deductions, paymentMethod: salaryData.paymentMethod, payrollPeriod: salaryData.payrollPeriod || '' }; //
    updatedSalary.total = updatedSalary.basic + updatedSalary.allowances - updatedSalary.deductions; //
    await putIntoStore(STORE_SALARIES, updatedSalary); //
    return updatedSalary;
}
async function deleteSalaryAPI(id) {
    await deleteFromStore(STORE_SALARIES, id); //
}

// Violations API
async function fetchViolationsAPI() {
    console.log("[API] Fetching violations from IndexedDB..."); //
    const rawViolations = await getAllFromStore(STORE_VIOLATIONS); //
    if (employees.length === 0) await fetchEmployeesAPI(); //
    violations = rawViolations.map(vio => { //
        const emp = employees.find(e => e.id === vio.employeeId); //
        return { ...vio, employeeName: emp ? emp.name : "غير معروف", amount: parseFloat(vio.amount) || 0, violationNumber: vio.violationNumber || '', plateNumber: vio.plateNumber || '', city: vio.city || '', details: vio.details || '', status: vio.status || 'غير مدفوعة' }; //
    });
    return violations;
}
async function addViolationAPI(violationData) {
    const id = await putIntoStore(STORE_VIOLATIONS, violationData); //
    const employee = employees.find(e => e.id === parseInt(violationData.employeeId)); //
    return { ...violationData, id: id, employeeId: parseInt(violationData.employeeId), employeeName: employee ? employee.name : "غير معروف", amount: parseFloat(violationData.amount) || 0, details: violationData.details, status: violationData.status }; //
}
async function updateViolationAPI(id, violationData) {
    const existingViolation = await getFromStore(STORE_VIOLATIONS, id); //
    if (!existingViolation) throw new Error("Violation record not found."); //
    const employee = employees.find(e => e.id === parseInt(violationData.employeeId)); //
    const updatedViolation = { ...existingViolation, ...violationData, employeeId: parseInt(violationData.employeeId), employeeName: employee ? employee.name : "غير معروف", amount: parseFloat(violationData.amount) || 0, details: violationData.details, status: violationData.status }; //
    await putIntoStore(STORE_VIOLATIONS, updatedViolation); //
    return updatedViolation;
}
async function deleteViolationAPI(id) {
    await deleteFromStore(STORE_VIOLATIONS, id); //
}

// Advances API
async function fetchAdvancesAPI() {
    console.log("[API] Fetching advances from IndexedDB..."); //
    const rawAdvances = await getAllFromStore(STORE_ADVANCES); //
    if (employees.length === 0) await fetchEmployeesAPI(); //
    advances = rawAdvances.map(adv => { //
        const emp = employees.find(e => e.id === adv.employeeId); //
        const amount = parseFloat(adv.amount) || 0; const paidAmount = parseFloat(adv.paidAmount) || 0; //
        let status;
        if (paidAmount >= amount && amount > 0) status = 'مستوفاة'; //
        else if (paidAmount > 0 && paidAmount < amount) status = 'مدفوع جزئياً'; //
        else status = 'مستحقة'; //
        return { ...adv, employeeName: emp ? emp.name : "غير معروف", amount: amount, paidAmount: paidAmount, remainingAmount: Math.max(0, amount - paidAmount), status: status }; //
    });
    return advances;
}
async function addAdvanceAPI(advanceData) {
    const newAdvanceData = { ...advanceData, paidAmount: 0, status: 'مستحقة' }; //
    const id = await putIntoStore(STORE_ADVANCES, newAdvanceData); //
    const employee = employees.find(e => e.id === parseInt(advanceData.employeeId)); //
    const amount = parseFloat(advanceData.amount) || 0; //
    return { ...newAdvanceData, id: id, employeeId: parseInt(advanceData.employeeId), employeeName: employee ? employee.name : "غير معروف", amount: amount, paidAmount: 0, remainingAmount: amount, status: 'مستحقة' }; //
}
async function updateAdvanceAPI(id, advanceData) {
    const existingAdvance = await getFromStore(STORE_ADVANCES, id); //
    if (!existingAdvance) throw new Error("Advance record not found."); //
    const updatedAdvanceData = { ...existingAdvance, employeeId: parseInt(advanceData.employeeId), date: advanceData.date, amount: parseFloat(advanceData.amount) || 0, reason: advanceData.reason, notes: advanceData.notes, }; //
    if (updatedAdvanceData.paidAmount >= updatedAdvanceData.amount && updatedAdvanceData.amount > 0) { updatedAdvanceData.status = 'مستوفاة'; updatedAdvanceData.paidAmount = updatedAdvanceData.amount; } //
    else if (updatedAdvanceData.paidAmount > 0 && updatedAdvanceData.paidAmount < updatedAdvanceData.amount) { updatedAdvanceData.status = 'مدفوع جزئياً'; } //
    else { updatedAdvanceData.status = 'مستحقة'; } //
    if (updatedAdvanceData.paidAmount < 0) updatedAdvanceData.paidAmount = 0; //
    await putIntoStore(STORE_ADVANCES, updatedAdvanceData); //
    const employee = employees.find(e => e.id === updatedAdvanceData.employeeId); //
    return { ...updatedAdvanceData, employeeName: employee ? employee.name : "غير معروف", remainingAmount: Math.max(0, updatedAdvanceData.amount - updatedAdvanceData.paidAmount) }; //
}
async function deleteAdvanceAPI(id) {
    await deleteFromStore(STORE_ADVANCES, id); //
}


// ⭐ --- Vacations API ---
async function fetchVacationsAPI() {
    console.log("[API] Fetching vacations from IndexedDB...");
    const rawVacations = await getAllFromStore(STORE_VACATIONS);
    if (employees.length === 0) await fetchEmployeesAPI(); // تأكد من تحميل الموظفين
    vacations = rawVacations.map(vac => {
        const emp = employees.find(e => e.id === vac.employeeId);
        const startDate = new Date(vac.vacationStartDate);
        const endDate = new Date(vac.vacationEndDate);
        // حساب مدة الإجازة بالأيام (شاملاً يوم البدء ويوم الانتهاء)
        let duration = 0;
        if (!isNaN(startDate) && !isNaN(endDate) && endDate >= startDate) {
            duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }


        // تحديد حالة الإجازة
        const today = new Date();
        today.setHours(0, 0, 0, 0); // تجاهل الوقت للمقارنة
        const sDate = new Date(vac.vacationStartDate);
        sDate.setHours(0,0,0,0);
        const eDate = new Date(vac.vacationEndDate);
        eDate.setHours(0,0,0,0);

        let status = "منتهية";
        if (sDate <= today && eDate >= today) {
            status = "حالية";
        } else if (sDate > today) {
            status = "قادمة";
        }

        return {
            ...vac,
            employeeName: emp ? emp.name : "غير معروف",
            duration: duration,
            status: status
        };
    });
    return vacations;
}

async function addVacationAPI(vacationData) {
    // التحقق من أن تاريخ الانتهاء ليس قبل تاريخ البدء
    if (new Date(vacationData.vacationEndDate) < new Date(vacationData.vacationStartDate)) {
        throw new Error("تاريخ انتهاء الإجازة لا يمكن أن يكون قبل تاريخ البدء.");
    }
    const id = await putIntoStore(STORE_VACATIONS, vacationData);
    const employee = employees.find(e => e.id === parseInt(vacationData.employeeId));
    return {
        ...vacationData,
        id: id,
        employeeId: parseInt(vacationData.employeeId),
        employeeName: employee ? employee.name : "غير معروف"
    };
}

async function updateVacationAPI(id, vacationData) {
    // التحقق من أن تاريخ الانتهاء ليس قبل تاريخ البدء
    if (new Date(vacationData.vacationEndDate) < new Date(vacationData.vacationStartDate)) {
        throw new Error("تاريخ انتهاء الإجازة لا يمكن أن يكون قبل تاريخ البدء.");
    }
    const existingVacation = await getFromStore(STORE_VACATIONS, id);
    if (!existingVacation) throw new Error("سجل الإجازة غير موجود.");

    const updatedVacation = {
        ...existingVacation,
        ...vacationData,
        employeeId: parseInt(vacationData.employeeId)
    };
    await putIntoStore(STORE_VACATIONS, updatedVacation);
    const employee = employees.find(e => e.id === updatedVacation.employeeId);
    return { ...updatedVacation, employeeName: employee ? employee.name : "غير معروف" };
}

async function deleteVacationAPI(id) {
    await deleteFromStore(STORE_VACATIONS, id);
}


// --- Generic Sorting Function ---
/**
 * Sorts an array of objects based on a specified key and direction.
 * @param {Array<Object>} array - The array to sort.
 * @param {string} key - The key (property name) to sort by.
 * @param {'asc'|'desc'} direction - The sort direction ('asc' for ascending, 'desc' for descending).
 * @returns {Array<Object>} The sorted array.
 */
function sortArray(array, key, direction) {
    if (!Array.isArray(array)) return [];
    return [...array].sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        // معالجة خاصة لحقل "duration" و "remainingTime" إذا كانت قيمًا محسوبة وليست مخزنة مباشرة
        if (key === 'duration' && typeof valA === 'undefined' && typeof valB === 'undefined' && a.vacationStartDate && a.vacationEndDate && b.vacationStartDate && b.vacationEndDate) {
            valA = (new Date(a.vacationEndDate).getTime() - new Date(a.vacationStartDate).getTime()) / (1000 * 60 * 60 * 24) + 1; //
            valB = (new Date(b.vacationEndDate).getTime() - new Date(b.vacationStartDate).getTime()) / (1000 * 60 * 60 * 24) + 1; //
        }
        // لا يوجد منطق فرز خاص لـ remainingTime هنا لأنه يجب أن يتم التعامل معه بشكل خاص في renderVacationsTable إذا لزم الأمر

        if (typeof valA === 'number' && typeof valB === 'number') { return direction === 'asc' ? valA - valB : valB - valA; } //
        if (typeof valA === 'string' && typeof valB === 'string') {
            if (key.toLowerCase().includes('date') || key === 'vacationStartDate' || key === 'vacationEndDate') { //
                const dateA = new Date(valA); //
                const dateB = new Date(valB); //
                if (!isNaN(dateA) && !isNaN(dateB)) { //
                    return direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime(); //
                }
            }
            return direction === 'asc' ? valA.localeCompare(valB, 'ar') : valB.localeCompare(valA, 'ar'); //
        }
        // معالجة القيم التي قد تكون null أو undefined
        if (valA == null && valB != null) return direction === 'asc' ? -1 : 1;
        if (valA != null && valB == null) return direction === 'asc' ? 1 : -1;
        if (valA == null && valB == null) return 0;

        if (valA < valB) return direction === 'asc' ? -1 : 1; //
        if (valA > valB) return direction === 'asc' ? 1 : -1; //
        return 0; //
    });
}

/**
 * Updates the sort indicators (arrows) in a table header.
 * @param {string} tableId - The ID of the table.
 * @param {string} currentColumn - The currently sorted column's data-sort-key.
 * @param {'asc'|'desc'} currentDirection - The current sort direction.
 */
function updateSortIndicators(tableId, currentColumn, currentDirection) {
    const tableElement = document.getElementById(tableId); //
    if (!tableElement) return;
    const headers = tableElement.querySelectorAll('thead th[data-sort-key]'); //
    headers.forEach(th => { //
        const sortKey = th.getAttribute('data-sort-key'); //
        let indicatorSpan = th.querySelector('.sort-indicator'); //
        if (!indicatorSpan) { //
            indicatorSpan = document.createElement('span'); //
            indicatorSpan.classList.add('sort-indicator'); //
            th.appendChild(indicatorSpan); //
        }
        indicatorSpan.textContent = (sortKey === currentColumn) ? (currentDirection === 'asc' ? ' ▲' : ' ▼') : ''; //
    });
}