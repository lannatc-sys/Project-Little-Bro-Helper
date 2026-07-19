/**
 * Project: Little Bro Helper (Backend API Engine)
 * Framework: Google Apps Script Web App
 * Security Role: Zero Server Data Storage & Privacy-First Architecture
 * Schema Control: English Column Headers (Fixed Template Layout)
 */

// โครงสร้างผังตารางฐานข้อมูลมาตรฐานที่ระบบต้องล็อกไว้ (Row 1 Layout)
const SHEETS_SCHEMA = {
  "Users": ["user_id", "telegram_username", "google_email", "registered_at"],
  "Finance": ["timestamp", "transaction_type", "category", "amount", "description", "file_attachment_url"],
  "Task": ["task_id", "task_name", "details", "status", "due_date", "reminder_time"],
  "Calendar": ["event_id", "event_title", "start_time", "end_time", "location", "notes"],
  "Customer": ["customer_id", "full_name", "phone_number", "email", "contact_info"],
  "Settings": ["setting_key", "setting_value"]
};

/**
 * 1. ฟังก์ชันหลักสำหรับรับ HTTP POST Request จาก Telegram Mini App
 */
function doPost(e) {
  // เปิดระบบ Script Lock เพื่อคุมคิวคอยข้อมูลชนกัน (Concurrency Control)
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // รอคิวนานสูงสุด 10 วินาที
    
    // แกะก้อนข้อมูล JSON
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var ssId = requestData.spreadsheet_id;
    
    if (!ssId) {
      throw new Error("Missing required 'spreadsheet_id' parameter");
    }
    
    // CASE A: สั่งจัดระเบียบและขึ้นตารางฐานข้อมูลใหม่ (Workspace Initializer)
    if (action === "initialize_workspace") {
      var initResult = runWorkspaceSetup(ssId);
      return createJsonResponse({ status: "success", message: "Workspace Initialized Successfully", sheets_processed: initResult });
    }
    
    // เปิดตัวเชื่อมฐานข้อมูล Google Sheets ของบอส
    var ss = SpreadsheetApp.openById(ssId);
    
    // CASE B: บันทึกรายการเงิน รายรับ-รายจ่าย (Finance Module)
    if (action === "add_expense" || action === "add_income") {
      var financeSheet = ss.getSheetByName("Finance");
      if (!financeSheet) throw new Error("ไม่พบชีต 'Finance' กรุณารัน initialize_workspace ก่อน");
      
      var txType = (action === "add_expense") ? "Expense" : "Income";
      
      // สั่ง Append Row เติมแถวข้อมูลตรงๆ ตามลำดับ Schema ภาษาอังกฤษ
      financeSheet.appendRow([
        new Date(),                               // timestamp
        txType,                                   // transaction_type
        requestData.category || "General",        // category
        Number(requestData.amount || 0),          // amount
        requestData.description || "",            // description
        requestData.file_attachment_url || ""     // file_attachment_url
      ]);
      
      return createJsonResponse({ status: "success", message: "บันทึกธุรกรรมการเงินลงแผ่นงานเป๊ะ 100% เรียบร้อย" });
    }
    
    // CASE C: เพิ่มงานในตารางจัดการงาน (Task Module)
    if (action === "add_task") {
      var taskSheet = ss.getSheetByName("Task");
      if (!taskSheet) throw new Error("ไม่พบชีต 'Task'");
      
      taskSheet.appendRow([
        "TASK_" + new Date().getTime(),          // task_id (สุ่มจากเวลาเสี้ยววินาที)
        requestData.task_name || "Untitled Task", // task_name
        requestData.details || "",                // details
        requestData.status || "Pending",          // status
        requestData.due_date || "",               // due_date
        requestData.reminder_time || ""           // reminder_time
      ]);
      
      return createJsonResponse({ status: "success", message: "เพิ่มภารกิจใหม่ลงฐานข้อมูลสำเร็จ" });
    }
    
    // หากส่ง Action แปลกปลอมมา
    throw new Error("Action command '" + action + "' not supported by Backend Engine.");
    
  } catch (error) {
    // พ่น Error แจ้งหน้าบ้านอย่างละเอียด
    return createJsonResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock(); // ปลดล็อกสคริปต์ให้คิวถัดไปทำงาน
  }
}

/**
 * 2. ฟังก์ชันตรวจสอบ คัดกรอง และสถาปนาหัวคอลัมน์ 6 ชีตหลัก
 */
function runWorkspaceSetup(spreadsheetId) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var logs = [];
  
  for (var sheetName in SHEETS_SCHEMA) {
    var sheet = ss.getSheetByName(sheetName);
    
    // ถ้าไม่มีชีตนี้ ให้กดเปิดชีตใหม่
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      logs.push("Created " + sheetName);
    } else {
      logs.push("Verified " + sheetName);
    }
    
    // ตรวจสอบและบังคับเขียนหัวข้อภาษาอังกฤษ Row 1 ใหม่อัตโนมัติ (Fixed Schema)
    var headerLength = SHEETS_SCHEMA[sheetName].length;
    sheet.getRange(1, 1, 1, headerLength).setValues([SHEETS_SCHEMA[sheetName]]);
    
    // ตั้งค่าความสวยงาม: ตรึงแนวแถวแรกไว้เสมอเพื่อความหรูหราเวลาบอสเลื่อนดูข้อมูล
    sheet.setFrozenRows(1);
  }
  
  return logs;
}

/**
 * 3. ฟังก์ชันแปลงค่าและพ่นรูปแบบกลับเป็น JSON MimeType มาตรฐาน (Helper)
 */
function createJsonResponse(outputObject) {
  return ContentService.createTextOutput(JSON.stringify(outputObject))
                        .setMimeType(ContentService.MimeType.JSON);
}
