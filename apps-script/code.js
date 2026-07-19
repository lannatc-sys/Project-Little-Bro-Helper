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
 * 1. ฟังก์ชันหลักสำหรับรับ HTTP POST Request จาก Telegram Mini App และ Bot
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // รอคิวนานสูงสุด 10 วินาที
    
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
    
    var ss = SpreadsheetApp.openById(ssId);
    
    // CASE B: เรียกอ่านข้อมูลทั้งหมดสำหรับแสดงผลแดชบอร์ด (Sync Dashboard Data)
    if (action === "get_dashboard_data") {
      var data = {};
      
      // 1. Finance data
      var financeSheet = ss.getSheetByName("Finance");
      if (financeSheet) {
        var financeRows = financeSheet.getDataRange().getValues();
        var headers = financeRows[0];
        var transactions = [];
        for (var i = 1; i < financeRows.length; i++) {
          var row = financeRows[i];
          var tx = {};
          for (var j = 0; j < headers.length; j++) {
            tx[headers[j]] = row[j];
          }
          transactions.push(tx);
        }
        data.finance = transactions;
      } else {
        data.finance = [];
      }
      
      // 2. Task data
      var taskSheet = ss.getSheetByName("Task");
      if (taskSheet) {
        var taskRows = taskSheet.getDataRange().getValues();
        var headers = taskRows[0];
        var tasks = [];
        for (var i = 1; i < taskRows.length; i++) {
          var row = taskRows[i];
          var t = {};
          for (var j = 0; j < headers.length; j++) {
            t[headers[j]] = row[j];
          }
          tasks.push(t);
        }
        data.tasks = tasks;
      } else {
        data.tasks = [];
      }
      
      // 3. Calendar data
      var calSheet = ss.getSheetByName("Calendar");
      if (calSheet) {
        var calRows = calSheet.getDataRange().getValues();
        var headers = calRows[0];
        var events = [];
        for (var i = 1; i < calRows.length; i++) {
          var row = calRows[i];
          var ev = {};
          for (var j = 0; j < headers.length; j++) {
            ev[headers[j]] = row[j];
          }
          events.push(ev);
        }
        data.calendar = events;
      } else {
        data.calendar = [];
      }
      
      return createJsonResponse({ status: "success", data: data });
    }
    
    // CASE C: บันทึกรายการเงิน รายรับ-รายจ่าย (Finance Module)
    if (action === "add_expense" || action === "add_income") {
      var financeSheet = ss.getSheetByName("Finance");
      if (!financeSheet) throw new Error("ไม่พบชีต 'Finance' กรุณารัน initialize_workspace ก่อน");
      
      var txType = (action === "add_expense") ? "Expense" : "Income";
      
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
    
    // CASE D: เพิ่มงานในตารางจัดการงาน (Task Module)
    if (action === "add_task") {
      var taskSheet = ss.getSheetByName("Task");
      if (!taskSheet) throw new Error("ไม่พบชีต 'Task'");
      
      taskSheet.appendRow([
        "TASK_" + new Date().getTime(),          // task_id
        requestData.task_name || "Untitled Task",
        requestData.details || "",
        requestData.status || "Pending",
        requestData.due_date || "",
        requestData.reminder_time || ""
      ]);
      
      return createJsonResponse({ status: "success", message: "เพิ่มภารกิจใหม่ลงฐานข้อมูลสำเร็จ" });
    }

    // CASE E: อัปเดตสถานะงาน (Update Task Status)
    if (action === "update_task_status") {
      var taskId = requestData.task_id;
      var newStatus = requestData.status; // "Completed" หรือ "Pending"
      if (!taskId) throw new Error("Missing 'task_id'");
      
      var taskSheet = ss.getSheetByName("Task");
      if (!taskSheet) throw new Error("ไม่พบชีต 'Task'");
      
      var rows = taskSheet.getDataRange().getValues();
      var taskIdColIdx = SHEETS_SCHEMA["Task"].indexOf("task_id");
      var statusColIdx = SHEETS_SCHEMA["Task"].indexOf("status");
      
      var foundRowIdx = -1;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][taskIdColIdx] === taskId) {
          foundRowIdx = i + 1; // 1-indexed
          break;
        }
      }
      
      if (foundRowIdx === -1) throw new Error("Task not found with ID: " + taskId);
      
      taskSheet.getRange(foundRowIdx, statusColIdx + 1).setValue(newStatus);
      return createJsonResponse({ status: "success", message: "อัปเดตสถานะภารกิจสำเร็จ" });
    }

    // CASE F: เพิ่มนัดหมายลงปฏิทิน (Calendar Module)
    if (action === "add_event") {
      var calSheet = ss.getSheetByName("Calendar");
      if (!calSheet) throw new Error("ไม่พบชีต 'Calendar'");
      
      calSheet.appendRow([
        "EVT_" + new Date().getTime(),
        requestData.event_title || "Untitled Event",
        requestData.start_time || "",
        requestData.end_time || "",
        requestData.location || "",
        requestData.notes || ""
      ]);
      
      return createJsonResponse({ status: "success", message: "บันทึกนัดหมายลงปฏิทินสำเร็จ" });
    }

    // CASE G: อัปเดตอัปโหลดไฟล์ไป Google Drive (File Upload Module)
    if (action === "upload_file") {
      var folderName = "Little Bro Helper Files";
      var folder;
      var folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
      
      var fileData = requestData.file_data; // base64 string
      var fileName = requestData.file_name || "upload_" + new Date().getTime();
      var mimeType = requestData.mime_type || "application/octet-stream";
      
      var decodedBytes = Utilities.base64Decode(fileData);
      var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      return createJsonResponse({ 
        status: "success", 
        message: "อัปโหลดไฟล์ไป Google Drive สำเร็จ", 
        file_url: file.getUrl() 
      });
    }

    // CASE H: เรียกรายการไฟล์ทั้งหมดใน Google Drive (List Files Module)
    if (action === "list_files") {
      var folderName = "Little Bro Helper Files";
      var folder;
      var folders = DriveApp.getFoldersByName(folderName);
      var fileList = [];
      
      if (folders.hasNext()) {
        folder = folders.next();
        var files = folder.getFiles();
        while (files.hasNext()) {
          var f = files.next();
          var sizeStr = f.getSize() >= 1048576 
            ? (f.getSize() / 1048576).toFixed(1) + " MB" 
            : Math.round(f.getSize() / 1024) + " KB";
            
          fileList.push({
            name: f.getName(),
            size: sizeStr,
            date: Utilities.formatDate(f.getDateCreated(), Session.getScriptTimeZone() || "GMT+7", "dd/MM/yyyy"),
            url: f.getUrl(),
            icon: f.getName().toLowerCase().endsWith(".pdf") ? "📄" : "🖼️"
          });
        }
      }
      
      return createJsonResponse({ status: "success", files: fileList });
    }

    // CASE I: สำรองข้อมูลสเปรดชีตไปที่โฟลเดอร์ Google Drive (Backup Database Module)
    if (action === "backup_workspace") {
      var backupFolderName = "Little Bro Helper Backups";
      var backupFolder;
      var folders = DriveApp.getFoldersByName(backupFolderName);
      if (folders.hasNext()) {
        backupFolder = folders.next();
      } else {
        backupFolder = DriveApp.createFolder(backupFolderName);
      }
      
      var file = DriveApp.getFileById(ssId);
      var dateString = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd_HH-mm");
      var backupCopy = file.makeCopy("Little Bro Helper Backup - " + dateString, backupFolder);
      
      return createJsonResponse({ 
        status: "success", 
        message: "สำรองข้อมูลสเปรดชีตเรียบร้อยแล้ว", 
        backup_url: backupCopy.getUrl() 
      });
    }
    
    throw new Error("Action command '" + action + "' not supported by Backend Engine.");
    
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
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
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      logs.push("Created " + sheetName);
    } else {
      logs.push("Verified " + sheetName);
    }
    
    var headerLength = SHEETS_SCHEMA[sheetName].length;
    sheet.getRange(1, 1, 1, headerLength).setValues([SHEETS_SCHEMA[sheetName]]);
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