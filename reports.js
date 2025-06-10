// reports.js

/**
 * دالة مساعدة لتطبيق الفلاتر المشتركة على بيانات التقارير.
 * @param {Array<Object>} dataArray - مصفوفة البيانات المراد تصفيتها.
 * @param {number} employeeId - معرّف الموظف (0 للكل).
 * @param {number} categoryId - معرّف القسم/الفئة (0 للكل).
 * @param {string} startDate - تاريخ البدء (YYYY-MM-DD).
 * @param {string} endDate - تاريخ الانتهاء (YYYY-MM-DD).
 * @param {string} year - السنة المحددة.
 * @param {string} month - الشهر المحدد ("all" أو "01"-"12").
 * @param {string} [itemSpecificStatus='all'] - حالة خاصة بالعنصر (مثل حالة السلفة).
 * @param {string} [itemType='generic'] - نوع العنصر للمساعدة في تحديد حقول التاريخ (مثل 'salary', 'violation', 'advance', 'vacation').
 * @param {string} [itemSpecificStatus2='all'] - حالة خاصة ثانوية بالعنصر (مثل حالة الإجازة).
 * @returns {Array<Object>} مصفوفة البيانات المصفاة.
 */
function applyReportFilters(dataArray, employeeId, categoryId, startDate, endDate, year, month, itemSpecificStatus = 'all', itemType = 'generic', itemSpecificStatus2 = 'all') {
    if (!dataArray || !Array.isArray(dataArray)) return [];

    return dataArray.filter(item => {
        let match = true;

        // فلتر الموظف
        if (employeeId !== 0 && item.employeeId && item.employeeId !== employeeId) {
            match = false;
        }

        // فلتر القسم/الفئة (يعتمد على وجود employeeId في العنصر)
        if (match && categoryId !== 0 && item.employeeId) {
            const employee = employees.find(e => e.id === item.employeeId);
            if (!employee || employee.categoryId !== categoryId) {
                match = false;
            }
        }

        // فلتر خاص بنوع العنصر (مثل حالة السلفة)
        if (match && itemType === 'advance' && itemSpecificStatus !== 'all' && item.status !== itemSpecificStatus) {
            match = false;
        }
        // ⭐ فلتر خاص بنوع العنصر (مثل حالة الإجازة)
        if (match && itemType === 'vacation' && itemSpecificStatus2 !== 'all') {
            // item.status هنا هو حالة الإجازة (حالية، قادمة، منتهية) التي تم حسابها مسبقًا
            if (item.status !== itemSpecificStatus2) {
                match = false;
            }
        }


        // فلتر التاريخ
        let itemDateValue;
        let itemEndDateValue; // للإجازات التي لها تاريخ انتهاء

        if (itemType === 'vacation') {
            itemDateValue = item.vacationStartDate;
            itemEndDateValue = item.vacationEndDate;
        } else {
            itemDateValue = item.date;
        }

        if (match && itemDateValue) {
            const itemDateObj = new Date(itemDateValue);
            itemDateObj.setHours(0,0,0,0);
            const itemEndDateObj = itemEndDateValue ? new Date(itemEndDateValue) : null;
            if (itemEndDateObj) itemEndDateObj.setHours(0,0,0,0);


            if (startDate && endDate) {
                const filterStartDate = new Date(startDate); filterStartDate.setHours(0,0,0,0);
                const filterEndDate = new Date(endDate); filterEndDate.setHours(0,0,0,0);

                if (itemType === 'vacation' && itemEndDateObj) {
                    // الإجازة تتقاطع مع النطاق إذا:
                    // (بداية الإجازة <= نهاية النطاق) و (نهاية الإجازة >= بداية النطاق)
                    if (!(itemDateObj <= filterEndDate && itemEndDateObj >= filterStartDate)) {
                        match = false;
                    }
                } else {
                    if (itemDateObj < filterStartDate || itemDateObj > filterEndDate) {
                        match = false;
                    }
                }
            } else if (year && month !== "all") {
                const reportMonthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
                const reportMonthEnd = new Date(parseInt(year), parseInt(month), 0); // آخر يوم في الشهر

                if (itemType === 'vacation' && itemEndDateObj) {
                     // الإجازة تتقاطع مع الشهر إذا:
                    // (بداية الإجازة <= نهاية الشهر) و (نهاية الإجازة >= بداية الشهر)
                    if (!(itemDateObj <= reportMonthEnd && itemEndDateObj >= reportMonthStart)) {
                        match = false;
                    }
                } else {
                    const itemYear = itemDateObj.getFullYear().toString();
                    const itemMonth = (itemDateObj.getMonth() + 1).toString().padStart(2, '0');
                    if (itemYear !== year || itemMonth !== month) {
                        match = false;
                    }
                }
            } else if (year && month === "all") {
                 const itemYear = itemDateObj.getFullYear().toString();
                 if (itemType === 'vacation' && itemEndDateObj) {
                    // الإجازة تتقاطع مع السنة إذا:
                    // (بداية الإجازة في هذه السنة أو قبلها) و (نهاية الإجازة في هذه السنة أو بعدها)
                    // أو بشكل أبسط: سنة بداية الإجازة أو سنة نهاية الإجازة تساوي السنة المطلوبة
                     if (itemDateObj.getFullYear().toString() !== year && itemEndDateObj.getFullYear().toString() !== year && !(itemDateObj.getFullYear().toString() < year && itemEndDateObj.getFullYear().toString() > year) ) {
                         match = false;
                     }
                 } else {
                    if (itemYear !== year) {
                        match = false;
                    }
                 }
            }
        } else if (match && ( (startDate && endDate) || (year && month !== "all") || (year && month === "all") ) ) {
             match = false;
        }
        return match;
    });
}

// --- دوال منطقية منفصلة لكل نوع تقرير ---

function generateSalarySlipReportLogic(employeeId, year, month) {
    if (employeeId === 0) {
        if (typeof showToast === 'function') showToast("يرجى اختيار موظف محدد لكشف الراتب المفصل.", "error");
        return null;
    }
    if (!year || month === "all") {
        if (typeof showToast === 'function') showToast("يرجى اختيار سنة وشهر محددين لكشف الراتب المفصل.", "error");
        return null;
    }

    const monthStr = `${year}-${month}`;
    const salaryRecord = salaries.find(s => s.employeeId === employeeId && (s.date || '').startsWith(monthStr));
    const employeeRecord = employees.find(e => e.id === employeeId);

    if (!salaryRecord || !employeeRecord) {
        return { title: `كشف راتب لـ ${employeeRecord ? employeeRecord.name : 'موظف غير معروف'}`, html: `<p class="text-gray-500">لم يتم العثور على سجل راتب لهذا الموظف في الفترة المحددة.</p>` };
    }

    const reportTitle = `كشف راتب مفصل لـ ${employeeRecord.name} عن شهر ${ARABIC_MONTHS[parseInt(month)-1]} سنة ${year}`;
    const slipHTML = `<div id="salarySlipContent" class="p-4 border rounded-md bg-gray-100 text-sm">
        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <p><strong>اسم الموظف:</strong></p><p>${employeeRecord.name}</p>
            <p><strong>القسم:</strong></p><p>${employeeRecord.categoryName || 'غير محدد'}</p>
            <p><strong>تاريخ الكشف:</strong></p><p>${salaryRecord.date}</p>
            <p><strong>فترة الراتب:</strong></p><p>${salaryRecord.payrollPeriod || 'غير محدد'}</p>
            <p class="col-span-2 pt-2 mt-2 border-t font-semibold">تفاصيل الراتب:</p>
            <p>الراتب الأساسي:</p><p class="text-left">${(salaryRecord.basic||0).toFixed(2)}</p>
            <p>البدلات:</p><p class="text-left">${(salaryRecord.allowances||0).toFixed(2)}</p>
            <p>إجمالي الاستحقاقات:</p><p class="text-left font-medium">${((salaryRecord.basic||0) + (salaryRecord.allowances||0)).toFixed(2)}</p>
            <p>الخصومات:</p><p class="text-left text-red-600">${(salaryRecord.deductions||0).toFixed(2)}</p>
            <p><strong>طريقة الدفع:</strong></p><p>${salaryRecord.paymentMethod || 'غير محدد'}</p>
            <p class="col-span-2 pt-2 mt-2 border-t font-bold text-lg">صافي الراتب:</p><p class="col-span-2 text-left font-bold text-lg text-green-600">${(salaryRecord.total||0).toFixed(2)}</p>
        </div>
    </div>`;
    return { title: reportTitle, html: slipHTML, tableId: null };
}

function generateDetailedMonthlySalaryReportLogic(employeeId, categoryId, year, month, startDate, endDate) {
    if (!year || month === "all") {
        if (typeof showToast === 'function') showToast("يرجى اختيار سنة وشهر محددين لتقرير الرواتب الشهري المفصل.", "error");
        return null;
    }

    let filteredSalaries = applyReportFilters(salaries, employeeId, categoryId, startDate, endDate, year, month, 'all', 'salary');
    let reportTitle = `تقرير رواتب شهري مفصل لشهر ${ARABIC_MONTHS[parseInt(month)-1]} سنة ${year}`;
    if (employeeId !== 0) { const emp = employees.find(e => e.id === employeeId); if(emp) reportTitle += ` للموظف: ${emp.name}`; }
    else if (categoryId !== 0) { const cat = categories.find(c => c.id === categoryId); if(cat) reportTitle += ` لقسم: ${cat.name}`; }

    if (filteredSalaries.length === 0) {
        return { title: reportTitle, html: `<p class="text-gray-500">لا توجد بيانات رواتب مطابقة للفلاتر المحددة في هذه الفترة.</p>` };
    }

    let tableHTML = `<div class="overflow-x-auto"><table id="detailedMonthlySalaryReportTable" class="min-w-full divide-y divide-gray-200 border border-gray-300 mt-2">
        <thead class="table-header"><tr>
            <th class="px-4 py-2 text-right">الموظف</th><th class="px-4 py-2 text-right">الأساسي</th>
            <th class="px-4 py-2 text-right">البدلات</th><th class="px-4 py-2 text-right">الخصومات</th>
            <th class="px-4 py-2 text-right">الصافي</th><th class="px-4 py-2 text-right">التاريخ</th>
            <th class="px-4 py-2 text-right">طريقة الدفع</th><th class="px-4 py-2 text-right">فترة الراتب</th>
        </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    let totalNetForMonth = 0;
    filteredSalaries.forEach(s => {
        tableHTML += `<tr>
            <td class="px-4 py-2">${s.employeeName}</td><td class="px-4 py-2 text-left">${(s.basic||0).toFixed(2)}</td>
            <td class="px-4 py-2 text-left">${(s.allowances||0).toFixed(2)}</td><td class="px-4 py-2 text-left">${(s.deductions||0).toFixed(2)}</td>
            <td class="px-4 py-2 font-semibold text-left">${(s.total||0).toFixed(2)}</td><td class="px-4 py-2">${s.date}</td>
            <td class="px-4 py-2">${s.paymentMethod || 'غير محدد'}</td><td class="px-4 py-2">${s.payrollPeriod || ''}</td>
        </tr>`;
        totalNetForMonth += (s.total||0);
    });
    tableHTML += `<tr class="bg-gray-100 font-bold">
        <td class="px-4 py-2" colspan="4">الإجمالي الكلي للشهر:</td>
        <td class="px-4 py-2 text-left text-indigo-700">${totalNetForMonth.toFixed(2)}</td>
        <td class="px-4 py-2" colspan="3"></td>
    </tr>`;
    tableHTML += `</tbody></table></div>`;
    return { title: reportTitle, html: tableHTML, tableId: 'detailedMonthlySalaryReportTable' };
}

function generateViolationReportLogic(employeeId, categoryId, year, month, startDate, endDate) {
    let filteredViolations = applyReportFilters(violations, employeeId, categoryId, startDate, endDate, year, month, 'all', 'violation');
    let reportTitle = `تقرير المخالفات`;
    if (employeeId !== 0) { const emp = employees.find(e => e.id === employeeId); if(emp) reportTitle += ` للموظف: ${emp.name}`; }
    else if (categoryId !== 0) { const cat = categories.find(c => c.id === categoryId); if(cat) reportTitle += ` لقسم: ${cat.name}`; }
    else { reportTitle += ` لجميع الموظفين`; }
    if (startDate && endDate) { reportTitle += ` من ${startDate} إلى ${endDate}`; }
    else if (year && month !== "all") { reportTitle += ` لشهر ${ARABIC_MONTHS[parseInt(month)-1]} سنة ${year}`; }
    else if (year) { reportTitle += ` لسنة ${year}`; }

    if (filteredViolations.length === 0) {
        return { title: reportTitle, html: `<p class="text-gray-500">لم يتم العثور على سجلات مخالفات مطابقة للفلاتر المحددة.</p>` };
    }
    let tableHTML = `<div class="overflow-x-auto"><table id="violationReportTable" class="min-w-full divide-y divide-gray-200 border border-gray-300 mt-2">
        <thead class="table-header"><tr>
            <th class="px-4 py-2 text-right">رقم المخالفة</th><th class="px-4 py-2 text-right">التاريخ</th>
            <th class="px-4 py-2 text-right">الموظف</th><th class="px-4 py-2 text-right">رقم اللوحة</th>
            <th class="px-4 py-2 text-right">المدينة</th><th class="px-4 py-2 text-right">المبلغ (ريال)</th>
            <th class="px-4 py-2 text-right">التفاصيل</th><th class="px-4 py-2 text-right">الحالة</th><th class="px-4 py-2 text-right">ملاحظات</th>
        </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    let totalViolationAmount = 0;
    filteredViolations.forEach(v => {
        tableHTML += `<tr>
            <td class="px-4 py-2">${v.violationNumber || ''}</td><td class="px-4 py-2">${v.date}</td>
            <td class="px-4 py-2">${v.employeeName}</td><td class="px-4 py-2">${v.plateNumber || ''}</td>
            <td class="px-4 py-2">${v.city || ''}</td><td class="px-4 py-2 text-red-600 text-left">${(v.amount||0).toFixed(2)}</td>
            <td class="px-4 py-2">${v.details || ''}</td><td class="px-4 py-2">${v.status || 'غير محدد'}</td><td class="px-4 py-2">${v.notes || ''}</td>
        </tr>`;
        totalViolationAmount += (v.amount||0);
    });
    tableHTML += `<tr class="bg-gray-100 font-bold">
        <td class="px-4 py-2" colspan="5">الإجمالي الكلي للمخالفات:</td>
        <td class="px-4 py-2 text-left text-red-700">${totalViolationAmount.toFixed(2)}</td>
        <td class="px-4 py-2" colspan="3"></td>
    </tr>`;
    tableHTML += `</tbody></table></div>`;
    return { title: reportTitle, html: tableHTML, tableId: 'violationReportTable' };
}

function generateResidencyExpiryReportLogic(employeeId, categoryId) {
    let filteredEmployees = employees.filter(emp => {
        let match = true;
        if (employeeId !== 0 && emp.id !== employeeId) match = false;
        if (match && categoryId !== 0 && emp.categoryId !== categoryId) match = false;
        return match;
    });

    let reportTitle = `تقرير انتهاء الإقامة`;
    if (employeeId !== 0) { const emp = employees.find(e => e.id === employeeId); if(emp) reportTitle += ` للموظف: ${emp.name}`; }
    else if (categoryId !== 0) { const cat = categories.find(c => c.id === categoryId); if(cat) reportTitle += ` لقسم: ${cat.name}`; }
    else { reportTitle += ` لجميع الموظفين`; }

    if (filteredEmployees.length === 0) {
        return { title: reportTitle, html: `<p class="text-gray-500">لا توجد بيانات موظفين مطابقة للفلاتر المحددة.</p>` };
    }

    let tableHTML = `<div class="overflow-x-auto"><table id="residencyExpiryReportTable" class="min-w-full divide-y divide-gray-200 border border-gray-300 mt-2">
        <thead class="table-header"><tr>
            <th class="px-4 py-2 text-right">م</th><th class="px-4 py-2 text-right">اسم الموظف</th>
            <th class="px-4 py-2 text-right">تاريخ انتهاء الهوية/الإقامة</th><th class="px-4 py-2 text-right">المدة المتبقية</th>
            <th class="px-4 py-2 text-right">الحالة</th>
        </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    filteredEmployees.forEach((emp, i) => {
        let expiryDateStr = emp.idExpiryDate; let remainingDurationText = "غير متوفر"; let status = "غير محدد"; let statusClass = "text-gray-500";
        if (expiryDateStr) {
            const expiryDate = new Date(expiryDateStr); expiryDate.setHours(0, 0, 0, 0);
            if (isNaN(expiryDate.getTime())) { expiryDateStr = "تاريخ غير صالح"; status = "خطأ في التاريخ"; statusClass = "text-red-800"; }
            else {
                const diffTime = expiryDate.getTime() - today.getTime(); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 0) { status = "منتهية"; statusClass = "text-red-600 font-bold"; remainingDurationText = "منتهية"; }
                else if (diffDays === 0) { status = "تنتهي اليوم"; statusClass = "text-orange-600 font-bold"; remainingDurationText = "تنتهي اليوم"; }
                else {
                    let years = 0; let months = 0; let days = 0; let tempDate = new Date(today.getTime()); tempDate.setHours(0,0,0,0);
                    while (new Date(tempDate.getFullYear() + 1, tempDate.getMonth(), tempDate.getDate()).getTime() <= expiryDate.getTime()) { years++; tempDate.setFullYear(tempDate.getFullYear() + 1); }
                    while (new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, tempDate.getDate()).getTime() <= expiryDate.getTime()) { months++; tempDate.setMonth(tempDate.getMonth() + 1); }
                    days = Math.ceil((expiryDate.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));
                    remainingDurationText = `${years} سنة, ${months} شهر, ${days} يوم`; status = "صالح"; statusClass = "text-green-600";
                    if (diffDays <= 30) { status = "قريب الانتهاء"; statusClass = "text-orange-600 font-semibold"; }
                }
            }
        }
        tableHTML += `<tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}"><td class="px-4 py-2">${emp.id}</td><td class="px-4 py-2">${emp.name}</td><td class="px-4 py-2">${expiryDateStr}</td><td class="px-4 py-2">${remainingDurationText}</td><td class="px-4 py-2 ${statusClass}">${status}</td></tr>`;
    });
    tableHTML += `</tbody></table></div>`;
    return { title: reportTitle, html: tableHTML, tableId: 'residencyExpiryReportTable' };
}

function generateAdvanceReportLogic(employeeId, categoryId, advanceStatus, year, month, startDate, endDate) {
    let filteredAdvances = applyReportFilters(advances, employeeId, categoryId, startDate, endDate, year, month, advanceStatus, 'advance');
    let reportTitle = `تقرير السلف`;
    if (employeeId !== 0) { const emp = employees.find(e => e.id === employeeId); if(emp) reportTitle += ` للموظف: ${emp.name}`; }
    else if (categoryId !== 0) { const cat = categories.find(c => c.id === categoryId); if(cat) reportTitle += ` لقسم: ${cat.name}`; }
    else { reportTitle += ` لجميع الموظفين`; }
    if (startDate && endDate) { reportTitle += ` من ${startDate} إلى ${endDate}`; }
    else if (year && month !== "all") { reportTitle += ` لشهر ${ARABIC_MONTHS[parseInt(month)-1]} سنة ${year}`; }
    else if (year) { reportTitle += ` لسنة ${year}`; }
    if (advanceStatus !== 'all') { reportTitle += ` (الحالة: ${advanceStatus})`; }

    if (filteredAdvances.length === 0) {
        return { title: reportTitle, html: `<p class="text-gray-500">لا توجد سجلات سلف مطابقة للفلاتر المحددة.</p>` };
    }
    let tableHTML = `<div class="overflow-x-auto"><table id="advanceReportTable" class="min-w-full divide-y divide-gray-200 border border-gray-300 mt-2">
        <thead class="table-header"><tr>
            <th class="px-4 py-2 text-right">م</th><th class="px-4 py-2 text-right">الموظف</th><th class="px-4 py-2 text-right">التاريخ</th>
            <th class="px-4 py-2 text-right">المبلغ الإجمالي</th><th class="px-4 py-2 text-right">المدفوع</th>
            <th class="px-4 py-2 text-right">المتبقي</th><th class="px-4 py-2 text-right">السبب</th>
            <th class="px-4 py-2 text-right">الحالة</th><th class="px-4 py-2 text-right">ملاحظات</th>
        </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    let totalOutstandingAmount = 0;
    filteredAdvances.forEach((adv, i) => {
        tableHTML += `<tr>
            <td class="px-4 py-2">${adv.id}</td><td class="px-4 py-2">${adv.employeeName}</td><td class="px-4 py-2">${adv.date}</td>
            <td class="px-4 py-2 text-left">${(adv.amount||0).toFixed(2)}</td><td class="px-4 py-2 text-left">${(adv.paidAmount||0).toFixed(2)}</td>
            <td class="px-4 py-2 text-left">${(adv.remainingAmount||0).toFixed(2)}</td><td class="px-4 py-2">${adv.reason || ''}</td>
            <td class="px-4 py-2">${adv.status}</td><td class="px-4 py-2">${adv.notes || ''}</td>
        </tr>`;
        if (adv.status !== 'مستوفاة') { totalOutstandingAmount += (adv.remainingAmount || 0); }
    });
    tableHTML += `<tr class="bg-gray-100 font-bold">
        <td class="px-4 py-2" colspan="5">إجمالي السلف المستحقة (المتبقية):</td>
        <td class="px-4 py-2 text-left text-indigo-700">${totalOutstandingAmount.toFixed(2)}</td>
        <td class="px-4 py-2" colspan="3"></td>
    </tr>`;
    tableHTML += `</tbody></table></div>`;
    return { title: reportTitle, html: tableHTML, tableId: 'advanceReportTable' };
}

function generateVacationReportLogic(employeeId, categoryId, vacationStatus, year, month, startDate, endDate) {
    let filteredVacations = applyReportFilters(vacations, employeeId, categoryId, startDate, endDate, year, month, 'all', 'vacation', vacationStatus);

    let reportTitle = `تقرير الإجازات`;
    if (employeeId !== 0) { const emp = employees.find(e => e.id === employeeId); if(emp) reportTitle += ` للموظف: ${emp.name}`; }
    else if (categoryId !== 0) { const cat = categories.find(c => c.id === categoryId); if(cat) reportTitle += ` لقسم: ${cat.name}`; }
    else { reportTitle += ` لجميع الموظفين`; }

    if (startDate && endDate) { reportTitle += ` من ${startDate} إلى ${endDate}`; }
    else if (year && month !== "all") { reportTitle += ` لشهر ${ARABIC_MONTHS[parseInt(month)-1]} سنة ${year}`; }
    else if (year) { reportTitle += ` لسنة ${year}`; }

    if (vacationStatus !== 'all') {
        let statusText = vacationStatus;
        if (vacationStatus === 'حالية') statusText = 'الحالية';
        else if (vacationStatus === 'قادمة') statusText = 'القادمة';
        else if (vacationStatus === 'منتهية') statusText = 'المنتهية';
        reportTitle += ` (الحالة: ${statusText})`;
    }

    if (filteredVacations.length === 0) {
        return { title: reportTitle, html: `<p class="text-gray-500">لا توجد سجلات إجازات مطابقة للفلاتر المحددة.</p>` };
    }

    let tableHTML = `<div class="overflow-x-auto"><table id="vacationReportTable" class="min-w-full divide-y divide-gray-200 border border-gray-300 mt-2">
        <thead class="table-header"><tr>
            <th class="px-4 py-2 text-right">م</th>
            <th class="px-4 py-2 text-right">الموظف</th>
            <th class="px-4 py-2 text-right">نوع الإجازة</th>
            <th class="px-4 py-2 text-right">تاريخ البدء</th>
            <th class="px-4 py-2 text-right">تاريخ الانتهاء</th>
            <th class="px-4 py-2 text-right">المدة (أيام)</th>
            <th class="px-4 py-2 text-right">الحالة</th>
            <th class="px-4 py-2 text-right">ملاحظات</th>
        </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;

    let totalVacationsCount = 0;
    let totalVacationDays = 0;

    filteredVacations.forEach((vac, i) => {
        const duration = vac.duration || 0;
        let statusClass = "text-gray-500";
        if (vac.status === "حالية") statusClass = "text-orange-600 font-semibold";
        else if (vac.status === "قادمة") statusClass = "text-blue-600";
        else if (vac.status === "منتهية") statusClass = "text-gray-400 italic";

        tableHTML += `<tr>
            <td class="px-4 py-2">${vac.id}</td>
            <td class="px-4 py-2">${vac.employeeName}</td>
            <td class="px-4 py-2">${vac.vacationType}</td>
            <td class="px-4 py-2">${vac.vacationStartDate}</td>
            <td class="px-4 py-2">${vac.vacationEndDate}</td>
            <td class="px-4 py-2 text-center">${duration}</td>
            <td class="px-4 py-2 ${statusClass}">${vac.status}</td>
            <td class="px-4 py-2">${vac.notes || ''}</td>
        </tr>`;
        totalVacationsCount++;
        totalVacationDays += duration;
    });

    tableHTML += `<tr class="bg-gray-100 font-bold">
        <td class="px-4 py-2" colspan="5">الإجمالي:</td>
        <td class="px-4 py-2 text-center text-indigo-700">${totalVacationDays} يوم</td>
        <td class="px-4 py-2 text-center text-indigo-700" colspan="1">${totalVacationsCount} إجازة</td>
        <td class="px-4 py-2"></td>
    </tr>`;
    tableHTML += `</tbody></table></div>`;
    return { title: reportTitle, html: tableHTML, tableId: 'vacationReportTable' };
}


function generateMonthlySummaryReportLogic(employeeId, categoryId, year, month, startDate, endDate) {
    let filteredSalaries = applyReportFilters(salaries, employeeId, categoryId, startDate, endDate, year, month, 'all', 'salary');
    let reportTitle = `ملخص الرواتب الشهري`;
    if (employeeId !== 0) { const emp = employees.find(e => e.id === employeeId); if(emp) reportTitle += ` للموظف: ${emp.name}`; }
    else if (categoryId !== 0) { const cat = categories.find(c => c.id === categoryId); if(cat) reportTitle += ` لقسم: ${cat.name}`; }
    else { reportTitle += ` لجميع الموظفين`; }
    if (startDate && endDate) { reportTitle += ` من ${startDate} إلى ${endDate}`; }
    else if (year && month !== "all") { reportTitle += ` لشهر ${ARABIC_MONTHS[parseInt(month)-1]} سنة ${year}`; }
    else if (year) { reportTitle += ` لسنة ${year}`; }

    if (filteredSalaries.length === 0) {
        return { title: reportTitle, html: `<p class="text-gray-500">لا توجد بيانات رواتب مطابقة للفلاتر المحددة.</p>` };
    }
    const monthlySummary = filteredSalaries.reduce((acc, salary) => {
        const monthYear = (salary.date || '').substring(0, 7);
        if(monthYear) {
            acc[monthYear] = acc[monthYear] || { totalBasic: 0, totalAllowances: 0, totalDeductions: 0, totalNet: 0 };
            acc[monthYear].totalBasic += (salary.basic||0);
            acc[monthYear].totalAllowances += (salary.allowances||0);
            acc[monthYear].totalDeductions += (salary.deductions||0);
            acc[monthYear].totalNet += (salary.total||0);
        }
        return acc;
    }, {});

    let tableHTML = `<div class="overflow-x-auto"><table id="monthlySummaryReportTable" class="min-w-full divide-y divide-gray-200 border border-gray-300 mt-2">
        <thead class="table-header"><tr>
            <th class="px-4 py-2 text-right">الشهر/السنة</th><th class="px-4 py-2 text-right">إجمالي الأساسي</th>
            <th class="px-4 py-2 text-right">إجمالي البدلات</th><th class="px-4 py-2 text-right">إجمالي الخصومات</th>
            <th class="px-4 py-2 text-right">إجمالي الصافي</th>
        </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    let grandTotalNet = 0;
    Object.keys(monthlySummary).sort().forEach(monthYearKey => {
        const data = monthlySummary[monthYearKey];
        const [yr, mn] = monthYearKey.split('-');
        const monthName = ARABIC_MONTHS[parseInt(mn) - 1];
        tableHTML += `<tr>
            <td class="px-4 py-2">${monthName} ${yr}</td><td class="px-4 py-2 text-left">${data.totalBasic.toFixed(2)}</td>
            <td class="px-4 py-2 text-left">${data.totalAllowances.toFixed(2)}</td><td class="px-4 py-2 text-left">${data.totalDeductions.toFixed(2)}</td>
            <td class="px-4 py-2 font-semibold text-left">${data.totalNet.toFixed(2)}</td>
        </tr>`;
        grandTotalNet += data.totalNet;
    });
    tableHTML += `<tr class="bg-gray-100 font-bold">
        <td class="px-4 py-2">الإجمالي الكلي:</td><td class="px-4 py-2" colspan="3"></td>
        <td class="px-4 py-2 text-left text-indigo-700">${grandTotalNet.toFixed(2)}</td>
    </tr>`;
    tableHTML += `</tbody></table></div>`;
    return { title: reportTitle, html: tableHTML, tableId: 'monthlySummaryReportTable' };
}

function generateYearlySummaryReportLogic(employeeId, categoryId, year, startDate, endDate) {
    const useDateRange = startDate && endDate;
    let filteredSalaries = applyReportFilters(salaries, employeeId, categoryId, startDate, endDate, useDateRange ? null : year, "all", 'all', 'salary');

    let reportTitle = `ملخص الرواتب السنوي`;
    if (employeeId !== 0) { const emp = employees.find(e => e.id === employeeId); if(emp) reportTitle += ` للموظف: ${emp.name}`; }
    else if (categoryId !== 0) { const cat = categories.find(c => c.id === categoryId); if(cat) reportTitle += ` لقسم: ${cat.name}`; }
    else { reportTitle += ` لجميع الموظفين`; }
    if (useDateRange) { reportTitle += ` من ${startDate} إلى ${endDate}`; }
    else if (year) { reportTitle += ` لسنة ${year}`; }

    if (filteredSalaries.length === 0) {
        return { title: reportTitle, html: `<p class="text-gray-500">لا توجد بيانات رواتب مطابقة للفلاتر المحددة.</p>` };
    }
    const yearlySummary = filteredSalaries.reduce((acc, salary) => {
        const yr = (salary.date || '').substring(0, 4);
        if(yr) {
            acc[yr] = acc[yr] || { totalBasic: 0, totalAllowances: 0, totalDeductions: 0, totalNet: 0 };
            acc[yr].totalBasic += (salary.basic||0);
            acc[yr].totalAllowances += (salary.allowances||0);
            acc[yr].totalDeductions += (salary.deductions||0);
            acc[yr].totalNet += (salary.total||0);
        }
        return acc;
    }, {});

    let tableHTML = `<div class="overflow-x-auto"><table id="yearlySummaryReportTable" class="min-w-full divide-y divide-gray-200 border border-gray-300 mt-2">
        <thead class="table-header"><tr>
            <th class="px-4 py-2 text-right">السنة</th><th class="px-4 py-2 text-right">إجمالي الأساسي</th>
            <th class="px-4 py-2 text-right">إجمالي البدلات</th><th class="px-4 py-2 text-right">إجمالي الخصومات</th>
            <th class="px-4 py-2 text-right">إجمالي الصافي</th>
        </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    let grandTotalNet = 0;
    Object.keys(yearlySummary).sort().forEach(yearKey => {
        const data = yearlySummary[yearKey];
        tableHTML += `<tr>
            <td class="px-4 py-2">${yearKey}</td><td class="px-4 py-2 text-left">${data.totalBasic.toFixed(2)}</td>
            <td class="px-4 py-2 text-left">${data.totalAllowances.toFixed(2)}</td><td class="px-4 py-2 text-left">${data.totalDeductions.toFixed(2)}</td>
            <td class="px-4 py-2 font-semibold text-left">${data.totalNet.toFixed(2)}</td>
        </tr>`;
        grandTotalNet += data.totalNet;
    });
    tableHTML += `<tr class="bg-gray-100 font-bold">
        <td class="px-4 py-2">الإجمالي الكلي:</td><td class="px-4 py-2" colspan="3"></td>
        <td class="px-4 py-2 text-left text-indigo-700">${grandTotalNet.toFixed(2)}</td>
    </tr>`;
    tableHTML += `</tbody></table></div>`;
    return { title: reportTitle, html: tableHTML, tableId: 'yearlySummaryReportTable' };
}

function renderComprehensiveDataReportLogic(reportOutputElement, exportButtonsContainerElement) {
    if(!reportOutputElement) return null;
    let reportHTML = `<h4 class="text-lg font-semibold text-gray-700 mb-4">تقرير البيانات الشامل</h4>`;
    reportHTML += `<div class="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"><h5 class="text-md font-semibold text-gray-700 mb-2">ملخص عام:</h5><p><strong>إجمالي عدد الموظفين:</strong> ${employees.length}</p>`;
    const totalSalariesEver = salaries.reduce((sum, sal) => sum + (sal.total || 0), 0); reportHTML += `<p><strong>إجمالي الرواتب المدفوعة (جميع السجلات):</strong> ${totalSalariesEver.toFixed(2)} ريال</p>`;
    const totalAdvancesOutstanding = advances.filter(adv => adv.status !== 'مستوفاة').reduce((sum, adv) => sum + (adv.remainingAmount || 0), 0); reportHTML += `<p><strong>إجمالي السلف المستحقة (غير المستوفاة):</strong> ${totalAdvancesOutstanding.toFixed(2)} ريال</p>`;
    const totalViolationsAmount = violations.reduce((sum, vio) => sum + (vio.amount || 0), 0); reportHTML += `<p><strong>إجمالي قيمة المخالفات (جميع السجلات):</strong> ${totalViolationsAmount.toFixed(2)} ريال</p>`;
    const unpaidOrPendingViolations = violations.filter(vio => vio.status === "غير مدفوعة" || vio.status === "قيد المراجعة"); reportHTML += `<p><strong>عدد المخالفات غير المدفوعة/قيد المراجعة:</strong> ${unpaidOrPendingViolations.length}</p>`;
    const today = new Date(); const expiringOrExpiredEmployees = employees.filter(emp => { if (emp.idExpiryDate) { const expiryDate = new Date(emp.idExpiryDate); expiryDate.setHours(0, 0, 0, 0); if(isNaN(expiryDate.getTime())) return false; const diffTime = expiryDate.getTime() - today.getTime(); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); return diffDays <= 90; } return false; }); reportHTML += `<p><strong>عدد الإقامات المنتهية أو القريبة الانتهاء (خلال 90 يوماً):</strong> ${expiringOrExpiredEmployees.length}</p></div>`;
    employees.forEach(emp => {
        reportHTML += `<div class="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50"><h5 class="text-md font-bold text-[#3f51b5] mb-3">بيانات الموظف: ${emp.name} (#${emp.id})</h5><p><strong>الفئة:</strong> ${emp.categoryName || 'غير محدد'}</p><p><strong>تاريخ الميلاد:</strong> ${emp.dateOfBirth || ''}</p><p><strong>رقم الهوية:</strong> ${emp.idNumber || ''}</p><p><strong>رقم إصدار الهوية:</strong> ${emp.idIssuanceNumber || ''}</p><p><strong>تاريخ انتهاء الهوية:</strong> ${emp.idExpiryDate || ''}</p><p><strong>اسم المنشأة:</strong> ${emp.companyName || ''}</p><p><strong>رقم المنشأة:</strong> ${emp.companyId || ''}</p><p><strong>رقم السيارة:</strong> ${emp.carNumber || 'غير محدد'}</p><p><strong>ملاحظات:</strong> ${emp.notes || ''}</p></div>`;
        const empSalaries = salaries.filter(s => s.employeeId === emp.id); if (empSalaries.length > 0) { reportHTML += `<div class="mt-4 overflow-x-auto"><h6 class="text-md font-semibold text-gray-700 mb-2">سجلات الرواتب:</h6><table id="comprehensiveSalariesTable_${emp.id}" class="min-w-full divide-y divide-gray-200 border border-gray-300"><thead class="table-header"><tr><th class="px-4 py-2 text-right">التاريخ</th><th class="px-4 py-2 text-right">فترة الراتب</th><th class="px-4 py-2 text-right">الأساسي</th><th class="px-4 py-2 text-right">البدلات</th><th class="px-4 py-2 text-right">الخصومات</th><th class="px-4 py-2 text-right">الإجمالي</th><th class="px-4 py-2 text-right">طريقة الدفع</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">`; empSalaries.forEach(sal => { reportHTML += `<tr><td class="px-4 py-2">${sal.date}</td><td class="px-4 py-2">${sal.payrollPeriod || ''}</td><td class="px-4 py-2 text-left">${(sal.basic||0).toFixed(2)}</td><td class="px-4 py-2 text-left">${(sal.allowances||0).toFixed(2)}</td><td class="px-4 py-2 text-left">${(sal.deductions||0).toFixed(2)}</td><td class="px-4 py-2 font-semibold text-left">${(sal.total||0).toFixed(2)}</td><td class="px-4 py-2">${sal.paymentMethod || 'غير محدد'}</td></tr>`; }); reportHTML += `</tbody></table></div>`; } else { reportHTML += `<p class="text-gray-500 mt-2">لا توجد سجلات رواتب لهذا الموظف.</p>`; }
        const empViolations = violations.filter(v => v.employeeId === emp.id); if (empViolations.length > 0) { reportHTML += `<div class="mt-4 overflow-x-auto"><h6 class="text-md font-semibold text-gray-700 mb-2">سجلات المخالفات:</h6><table id="comprehensiveViolationsTable_${emp.id}" class="min-w-full divide-y divide-gray-200 border border-gray-300"><thead class="table-header"><tr><th class="px-4 py-2 text-right">رقم المخالفة</th><th class="px-4 py-2 text-right">التاريخ</th><th class="px-4 py-2 text-right">المبلغ</th><th class="px-4 py-2 text-right">التفاصيل</th><th class="px-4 py-2 text-right">الحالة</th><th class="px-4 py-2 text-right">رقم اللوحة</th><th class="px-4 py-2 text-right">المدينة</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">`; empViolations.forEach(vio => { reportHTML += `<tr><td class="px-4 py-2">${vio.violationNumber || ''}</td><td class="px-4 py-2">${vio.date}</td><td class="px-4 py-2 text-left">${(vio.amount||0).toFixed(2)}</td><td class="px-4 py-2">${vio.details || ''}</td><td class="px-4 py-2">${vio.status || 'غير محدد'}</td><td class="px-4 py-2">${vio.plateNumber || ''}</td><td class="px-4 py-2">${vio.city || ''}</td></tr>`; }); reportHTML += `</tbody></table></div>`; } else { reportHTML += `<p class="text-gray-500 mt-2">لا توجد سجلات مخالفات لهذا الموظف.</p>`; }
        const empAdvances = advances.filter(a => a.employeeId === emp.id); if (empAdvances.length > 0) { reportHTML += `<div class="mt-4 overflow-x-auto"><h6 class="text-md font-semibold text-gray-700 mb-2">سجلات السلف:</h6><table id="comprehensiveAdvancesTable_${emp.id}" class="min-w-full divide-y divide-gray-200 border border-gray-300"><thead class="table-header"><tr><th class="px-4 py-2 text-right">التاريخ</th><th class="px-4 py-2 text-right">المبلغ الإجمالي</th><th class="px-4 py-2 text-right">المدفوع</th><th class="px-4 py-2 text-right">المتبقي</th><th class="px-4 py-2 text-right">السبب</th><th class="px-4 py-2 text-right">الحالة</th><th class="px-4 py-2 text-right">ملاحظات</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">`; empAdvances.forEach(adv => { reportHTML += `<tr><td class="px-4 py-2">${adv.date}</td><td class="px-4 py-2 text-left">${(adv.amount||0).toFixed(2)}</td><td class="px-4 py-2 text-left">${(adv.paidAmount||0).toFixed(2)}</td><td class="px-4 py-2 text-left">${(adv.remainingAmount||0).toFixed(2)}</td><td class="px-4 py-2">${adv.reason || ''}</td><td class="px-4 py-2">${adv.status}</td><td class="px-4 py-2">${adv.notes || ''}</td></tr>`; }); reportHTML += `</tbody></table></div>`; } else { reportHTML += `<p class="text-gray-500 mt-2">لا توجد سجلات سلف لهذا الموظف.</p>`; }
        // ⭐ إضافة سجلات الإجازات للتقرير الشامل
        const empVacations = vacations.filter(v => v.employeeId === emp.id);
        if (empVacations.length > 0) {
            reportHTML += `<div class="mt-4 overflow-x-auto"><h6 class="text-md font-semibold text-gray-700 mb-2">سجلات الإجازات:</h6><table id="comprehensiveVacationsTable_${emp.id}" class="min-w-full divide-y divide-gray-200 border border-gray-300"><thead class="table-header"><tr><th class="px-4 py-2 text-right">نوع الإجازة</th><th class="px-4 py-2 text-right">تاريخ البدء</th><th class="px-4 py-2 text-right">تاريخ الانتهاء</th><th class="px-4 py-2 text-right">المدة</th><th class="px-4 py-2 text-right">الحالة</th><th class="px-4 py-2 text-right">ملاحظات</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
            empVacations.forEach(vac => {
                reportHTML += `<tr><td class="px-4 py-2">${vac.vacationType}</td><td class="px-4 py-2">${vac.vacationStartDate}</td><td class="px-4 py-2">${vac.vacationEndDate}</td><td class="px-4 py-2">${vac.duration || 0}</td><td class="px-4 py-2">${vac.status}</td><td class="px-4 py-2">${vac.notes || ''}</td></tr>`;
            });
            reportHTML += `</tbody></table></div>`;
        } else {
            reportHTML += `<p class="text-gray-500 mt-2">لا توجد سجلات إجازات لهذا الموظف.</p>`;
        }
        reportHTML += `<hr class="my-6 border-gray-300">`;
    });
    reportOutputElement.innerHTML = reportHTML;
    if(exportButtonsContainerElement) exportButtonsContainerElement.style.display = "flex";
}

// --- الدالة الرئيسية لمعالجة إنشاء التقارير المخصصة ---
/**
 * تعالج إنشاء التقارير المخصصة بناءً على الفلاتر وتعرضها.
 * ... (التعليقات الأخرى تبقى كما هي)
 * @param {string} [selectedVacationStatus='all'] -  ⭐ حالة الإجازة المختارة.
 */
function handleGenerateCustomReport(
    reportType,
    selectedEmployeeId,
    selectedCategoryId,
    selectedAdvanceStatus,
    selectedYear,
    selectedMonth,
    startDateStr,
    endDateStr,
    reportOutputElement,
    exportButtonsContainerElement,
    selectedVacationStatus = 'all'
) {
    if(reportOutputElement) reportOutputElement.innerHTML = "";
    if(exportButtonsContainerElement) exportButtonsContainerElement.style.display = "none";

    let reportData = null;

    switch (reportType) {
        case "salarySlip":
            reportData = generateSalarySlipReportLogic(selectedEmployeeId, selectedYear, selectedMonth);
            break;
        case "detailedMonthlySalary":
            reportData = generateDetailedMonthlySalaryReportLogic(selectedEmployeeId, selectedCategoryId, selectedYear, selectedMonth, startDateStr, endDateStr);
            break;
        case "violationReport":
            reportData = generateViolationReportLogic(selectedEmployeeId, selectedCategoryId, selectedYear, selectedMonth, startDateStr, endDateStr);
            break;
        case "residencyExpiryReport":
            reportData = generateResidencyExpiryReportLogic(selectedEmployeeId, selectedCategoryId);
            break;
        case "advanceReport":
            reportData = generateAdvanceReportLogic(selectedEmployeeId, selectedCategoryId, selectedAdvanceStatus, selectedYear, selectedMonth, startDateStr, endDateStr);
            break;
        case "vacationReport":
            reportData = generateVacationReportLogic(selectedEmployeeId, selectedCategoryId, selectedVacationStatus, selectedYear, selectedMonth, startDateStr, endDateStr);
            break;
        case "monthlySummary":
            reportData = generateMonthlySummaryReportLogic(selectedEmployeeId, selectedCategoryId, selectedYear, selectedMonth, startDateStr, endDateStr);
            break;
        case "yearlySummary":
            reportData = generateYearlySummaryReportLogic(selectedEmployeeId, selectedCategoryId, selectedYear, startDateStr, endDateStr);
            break;
        case "comprehensiveData":
            renderComprehensiveDataReportLogic(reportOutputElement, exportButtonsContainerElement);
            return;
        default:
            if(reportOutputElement) reportOutputElement.innerHTML = `<p class="text-gray-500">نوع التقرير المخصص غير مدعوم حاليًا.</p>`;
    }

    if (reportData && reportOutputElement) {
        reportOutputElement.innerHTML = `<h4 class="text-lg font-semibold text-gray-700 mb-2">${reportData.title}</h4>${reportData.html}`;
        if (reportData.html && !reportData.html.includes("لا توجد بيانات") && !reportData.html.includes("يرجى اختيار")) {
            if(exportButtonsContainerElement) exportButtonsContainerElement.style.display = "flex";
        }
    } else if (reportOutputElement && !reportData && reportType !== "comprehensiveData") {
        //  (التعليق السابق يبقى كما هو)
    }
}