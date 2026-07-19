/**
 * Project: Little Bro Assistant (Backend API Engine)
 * Framework: Google Apps Script Web App
 * Security Role: Zero Server Data Storage & Privacy-First Architecture
 * Schema Control: English Column Headers (Fixed Template Layout)
 */

// โครงสร้างผังตารางฐานข้อมูลมาตรฐานที่ระบบต้องล็อกไว้ (Row 1 Layout)
const SHEETS_SCHEMA = {
  "Profiles": ["user_id", "telegram_username", "google_email", "registered_at"],
  "Finance": ["timestamp", "transaction_type", "category", "amount", "description", "file_attachment_url"],
  "Task": ["task_id", "task_name", "details", "status", "due_date", "reminder_time", "google_task_id"],
  "Calendar": ["event_id", "event_title", "start_time", "end_time", "location", "notes"],
  "Contacts": ["customer_id", "full_name", "phone_number", "email", "contact_info"],
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
    
    // CASE: สร้างฐานข้อมูลบัญชีใหม่ตั้งแต่ต้น (Create New Spreadsheet & Folder Database)
    if (action === "create_user_database") {
      var userName = requestData.user_name || "New User";
      
      // 1. สร้างโฟลเดอร์ใน Google Drive
      var folderName = "Little Bro Assistant - " + userName;
      var folder = DriveApp.createFolder(folderName);
      
      // 2. สร้าง Spreadsheet ใหม่
      var newSS = SpreadsheetApp.create("Little Bro Assistant Database");
      var newSSId = newSS.getId();
      
      // 3. ย้าย Spreadsheet ไปไว้ในโฟลเดอร์ที่สร้าง
      var file = DriveApp.getFileById(newSSId);
      file.moveTo(folder);
      
      // 4. รันระบบเซ็ตอัพตาราง (Header & Frozen)
      var initResult = runWorkspaceSetup(newSSId);
      
      return createJsonResponse({ 
        status: "success", 
        message: "สร้างฐานข้อมูลใหม่สำเร็จเรียบร้อย", 
        spreadsheet_id: newSSId,
        folder_id: folder.getId(),
        sheets_processed: initResult
      });
    }

    if (!ssId) {
      throw new Error("Missing required 'spreadsheet_id' parameter");
    }
    
    // CASE A: สั่งจัดระเบียบและขึ้นตารางฐานข้อมูลใหม่ (Workspace Initializer)
    if (action === "initialize_workspace") {
      var initResult = runWorkspaceSetup(ssId);
      setupTimeTrigger(); // ตั้งค่าตารางคิวเวลาแจ้งเตือนสะสมอัตโนมัติ
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

      // 4. Contacts data
      var custSheet = ss.getSheetByName("Contacts");
      if (custSheet) {
        var custRows = custSheet.getDataRange().getValues();
        var headers = custRows[0];
        var customers = [];
        for (var i = 1; i < custRows.length; i++) {
          var row = custRows[i];
          var c = {};
          for (var j = 0; j < headers.length; j++) {
            c[headers[j]] = row[j];
          }
          customers.push(c);
        }
        data.customers = customers;
      } else {
        data.customers = [];
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
    
    // CASE C.2: ลบรายการธุรกรรมการเงิน (Delete Finance Transaction)
    if (action === "delete_expense") {
      var financeSheet = ss.getSheetByName("Finance");
      if (!financeSheet) throw new Error("ไม่พบชีต 'Finance'");
      
      var targetTimestamp = requestData.timestamp;
      if (!targetTimestamp) throw new Error("Missing 'timestamp'");
      
      var rows = financeSheet.getDataRange().getValues();
      var deleted = false;
      
      // ค้นหาจากล่างขึ้นบน
      for (var i = rows.length - 1; i >= 1; i--) {
        var rowTime = rows[i][0];
        // แปลงทั้งคู่เป็น ISO string หรือจัดฟอร์แมตเทียบกันเพื่อความแม่นยำ
        var rowTimeStr = (rowTime instanceof Date) ? rowTime.toISOString() : rowTime.toString();
        var targetTimeStr = (typeof targetTimestamp === "string") ? targetTimestamp : new Date(targetTimestamp).toISOString();
        
        if (rowTimeStr === targetTimeStr || new Date(rowTime).getTime() === new Date(targetTimestamp).getTime()) {
          financeSheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      
      if (deleted) {
        return createJsonResponse({ status: "success", message: "ลบธุรกรรมการเงินเรียบร้อยครับบอส" });
      } else {
        return createJsonResponse({ status: "error", message: "ไม่พบรายการธุรกรรมที่ต้องการลบในชีต" });
      }
    }

    // CASE D: เพิ่มงานในตารางจัดการงาน (Task Module)
    if (action === "add_task") {
      var taskSheet = ss.getSheetByName("Task");
      if (!taskSheet) throw new Error("ไม่พบชีต 'Task'");
      
      var googleTaskId = "";
      var errorMsg = "";
      if (typeof Tasks !== "undefined") {
        try {
          var listId = getOrCreateGoogleTaskList();
          var statusVal = (requestData.status === "Completed") ? "completed" : "needsAction";
          var taskObj = {
            title: requestData.task_name || "Untitled Task",
            notes: requestData.details || "",
            status: statusVal
          };
          if (requestData.due_date) {
            var parsedDate = new Date(requestData.due_date);
            if (!isNaN(parsedDate.getTime())) {
              taskObj.due = parsedDate.toISOString();
            }
          }
          var createdTask = Tasks.Tasks.insert(taskObj, listId);
          googleTaskId = createdTask.id;
        } catch (tErr) {
          errorMsg = " (แต่การซิงก์ Google Tasks ขัดข้อง: " + tErr.toString() + ")";
        }
      }
      
      taskSheet.appendRow([
        "TASK_" + new Date().getTime(),          // task_id
        requestData.task_name || "Untitled Task",
        requestData.details || "",
        requestData.status || "Pending",
        requestData.due_date || "",
        requestData.reminder_time || "",
        googleTaskId                             // google_task_id
      ]);
      
      return createJsonResponse({ status: "success", message: "เพิ่มภารกิจใหม่ลงฐานข้อมูลสำเร็จ" + errorMsg });
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
      var googleTaskIdColIdx = SHEETS_SCHEMA["Task"].indexOf("google_task_id");
      
      var foundRowIdx = -1;
      var googleTaskId = "";
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][taskIdColIdx] === taskId) {
          foundRowIdx = i + 1; // 1-indexed
          if (googleTaskIdColIdx !== -1) {
            googleTaskId = rows[i][googleTaskIdColIdx];
          }
          break;
        }
      }
      
      if (foundRowIdx === -1) throw new Error("Task not found with ID: " + taskId);
      
      // อัปเดตสถานะใน Google Sheets
      taskSheet.getRange(foundRowIdx, statusColIdx + 1).setValue(newStatus);
      
      // อัปเดตสถานะใน Google Tasks (ถ้ามี)
      var errorMsg = "";
      if (typeof Tasks !== "undefined" && googleTaskId) {
        try {
          var listId = getOrCreateGoogleTaskList();
          var statusVal = (newStatus === "Completed") ? "completed" : "needsAction";
          var tTask = Tasks.Tasks.get(listId, googleTaskId);
          tTask.status = statusVal;
          if (statusVal === "completed") {
            tTask.completed = new Date().toISOString();
          } else {
            tTask.completed = null;
          }
          Tasks.Tasks.update(tTask, listId, googleTaskId);
        } catch (tErr) {
          errorMsg = " (การซิงก์ Google Tasks ขัดข้อง: " + tErr.toString() + ")";
        }
      }
      
      return createJsonResponse({ status: "success", message: "อัปเดตสถานะภารกิจสำเร็จ" + errorMsg });
    }

    // CASE F: เพิ่มนัดหมายลงปฏิทิน (Calendar Module & Google Calendar Integration)
    if (action === "add_event") {
      var calSheet = ss.getSheetByName("Calendar");
      if (!calSheet) throw new Error("ไม่พบชีต 'Calendar'");
      
      var eventTitle = requestData.event_title || "Untitled Event";
      var startTimeStr = requestData.start_time || "";
      var endTimeStr = requestData.end_time || "";
      var location = requestData.location || "";
      var notes = requestData.notes || "";
      
      // 1. บันทึกข้อมูลลงแผ่นงาน Google Sheets
      calSheet.appendRow([
        "EVT_" + new Date().getTime(),
        eventTitle,
        startTimeStr,
        endTimeStr,
        location,
        notes
      ]);
      
      // 2. สร้างนัดหมายจริงใน Google Calendar หลัก (Primary Calendar)
      try {
        var startTime = startTimeStr ? new Date(startTimeStr) : new Date();
        var endTime = endTimeStr ? new Date(endTimeStr) : new Date(startTime.getTime() + 3600000);
        
        CalendarApp.getDefaultCalendar().createEvent(
          eventTitle,
          startTime,
          endTime,
          {
            location: location,
            description: notes
          }
        );
      } catch (calErr) {
        console.error("Google Calendar synchronization error: " + calErr.toString());
      }
      
      return createJsonResponse({ status: "success", message: "บันทึกนัดหมายลงชีตและ Google Calendar สำเร็จเรียบร้อยครับ" });
    }

    // CASE H: สั่งรันวิเคราะห์ตรวจสุขภาพการเงินรายเดือน (SET Happy Money Report)
    if (action === "run_financial_health_report") {
      var reportText = checkMonthlyFinancialHealth(ssId);
      
      var profilesSheet = ss.getSheetByName("Profiles");
      var botToken = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
      if (!botToken) {
        var settingsSheet = ss.getSheetByName("Settings");
        if (settingsSheet) {
          var sRows = settingsSheet.getDataRange().getValues();
          for (var i = 1; i < sRows.length; i++) {
            if (sRows[i][0] === "TELEGRAM_BOT_TOKEN") {
              botToken = sRows[i][1].toString();
              break;
            }
          }
        }
      }
      
      if (profilesSheet && botToken) {
        var pRows = profilesSheet.getDataRange().getValues();
        var userIdColIdx = SHEETS_SCHEMA["Profiles"].indexOf("user_id");
        if (userIdColIdx !== -1 && pRows.length > 1) {
          var chatId = pRows[1][userIdColIdx].toString();
          if (chatId) {
            sendTelegramNotification(botToken, chatId, "🧪 *ส่งข้อความแจ้งเตือนทดสอบระบบตรวจสอบสุขภาพการเงิน:*\n\n" + reportText);
          }
        }
      }
      
      return createJsonResponse({ status: "success", message: "วิเคราะห์ตรวจสอบสุขภาพการเงินสำเร็จและส่งแจ้งเตือนแล้วครับ", report: reportText });
    }

    // CASE G: อัปเดตอัปโหลดไฟล์ไป Google Drive (File Upload Module)
    if (action === "upload_file") {
      var folderName = "Little Bro Assistant Files";
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
      var folderName = "Little Bro Assistant Files";
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
      var backupFolderName = "Little Bro Assistant Backups";
      var backupFolder;
      var folders = DriveApp.getFoldersByName(backupFolderName);
      if (folders.hasNext()) {
        backupFolder = folders.next();
      } else {
        backupFolder = DriveApp.createFolder(backupFolderName);
      }
      
      var file = DriveApp.getFileById(ssId);
      var dateString = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd_HH-mm");
      var backupCopy = file.makeCopy("Little Bro Assistant Backup - " + dateString, backupFolder);
      
      return createJsonResponse({ 
        status: "success", 
        message: "สำรองข้อมูลสเปรดชีตเรียบร้อยแล้ว", 
        backup_url: backupCopy.getUrl() 
      });
    }

    // CASE J: เพิ่มชื่อผู้ใช้งานระบบ (User Registration Module)
    if (action === "add_user") {
      var usersSheet = ss.getSheetByName("Profiles");
      if (!usersSheet) throw new Error("ไม่พบชีต 'Profiles'");
      
      var rows = usersSheet.getDataRange().getValues();
      var userIdColIdx = SHEETS_SCHEMA["Profiles"].indexOf("user_id");
      var exists = false;
      var newUserId = requestData.user_id.toString();
      
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][userIdColIdx].toString() === newUserId) {
          exists = true;
          // เลื่อนตัวตนผู้รับการแจ้งเตือนมาอยู่แถวบนสุดหากซ้ำ
          usersSheet.getRange(i + 1, SHEETS_SCHEMA["Profiles"].indexOf("registered_at") + 1).setValue(new Date());
          break;
        }
      }
      
      if (!exists) {
        // หากไม่มี ให้ต่อแถวเพิ่มข้อมูลผู้ใช้/กลุ่มสนทนาใหม่เพื่อรับแจ้งเตือนหลัก
        usersSheet.appendRow([
          newUserId,
          requestData.telegram_username || "",
          requestData.google_email || "",
          new Date()
        ]);
      }
      
      return createJsonResponse({ status: "success", message: "สลับพิกัดจัดเก็บ Chat ID ล่าสุดลงชีตสำเร็จ" });
    }

    // CASE K: เพิ่มข้อมูลลูกค้า (Add Customer Module)
    if (action === "add_customer") {
      var custSheet = ss.getSheetByName("Contacts");
      if (!custSheet) throw new Error("ไม่พบชีต 'Contacts'");
      
      custSheet.appendRow([
        "CUST_" + new Date().getTime(),
        requestData.full_name || "Untitled Contact",
        requestData.phone_number || "",
        requestData.email || "",
        requestData.contact_info || ""
      ]);
      
      return createJsonResponse({ status: "success", message: "บันทึกข้อมูลรายชื่อติดต่อใหม่สำเร็จ" });
    }

    // CASE L: เรียกดูข้อมูลการตั้งค่าระบบ (Get Workspace Settings)
    if (action === "get_settings") {
      var settingsSheet = ss.getSheetByName("Settings");
      if (!settingsSheet) throw new Error("ไม่พบชีต 'Settings'");
      var rows = settingsSheet.getDataRange().getValues();
      var settings = {};
      for (var i = 1; i < rows.length; i++) {
        settings[rows[i][0].toString()] = rows[i][1].toString();
      }
      return createJsonResponse({ status: "success", settings: settings });
    }

    // CASE M: บันทึก/อัปเดตค่าตั้งค่าระบบ (Save Workspace Settings)
    if (action === "save_settings") {
      var settingsSheet = ss.getSheetByName("Settings");
      if (!settingsSheet) throw new Error("ไม่พบชีต 'Settings'");
      var key = requestData.setting_key;
      var val = requestData.setting_value;
      if (!key) throw new Error("Missing 'setting_key'");
      
      var rows = settingsSheet.getDataRange().getValues();
      var foundRowIdx = -1;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0].toString() === key) {
          foundRowIdx = i + 1;
          break;
        }
      }
      
      if (foundRowIdx !== -1) {
        settingsSheet.getRange(foundRowIdx, 2).setValue(val);
      } else {
        settingsSheet.appendRow([key, val]);
      }
      
      return createJsonResponse({ status: "success", message: "บันทึกค่าระบบสำเร็จ" });
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

  // 2. ค้นหาหรือสร้าง ปฏิทิน Little Bro Assistant อัตโนมัติ
  try {
    var calendarName = "Little Bro Assistant";
    var cals = CalendarApp.getCalendarsByName(calendarName);
    var cal;
    if (cals.length === 0) {
      cal = CalendarApp.createCalendar(calendarName);
      logs.push("Created secondary calendar: " + calendarName);
    } else {
      cal = cals[0];
      logs.push("Verified secondary calendar: " + calendarName);
    }
    
    // บันทึก ID ปฏิทินลงในชีต Settings
    var settingsSheet = ss.getSheetByName("Settings");
    if (settingsSheet) {
      var rows = settingsSheet.getDataRange().getValues();
      var foundRowIdx = -1;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0].toString() === "GOOGLE_CALENDAR_ID") {
          foundRowIdx = i + 1;
          break;
        }
      }
      if (foundRowIdx !== -1) {
        settingsSheet.getRange(foundRowIdx, 2).setValue(cal.getId());
      } else {
        settingsSheet.appendRow(["GOOGLE_CALENDAR_ID", cal.getId()]);
      }
    }
  } catch (err) {
    logs.push("Calendar setup error: " + err.toString());
  }
  
  return logs;
}

/**
 * 3. ฟังก์ชันแจ้งเตือนงานเช็คลิสต์ด่วนอัตโนมัติ (Time-driven Scheduler Trigger)
 * ค้นหาภารกิจที่ยังไม่เสร็จ และตรงเวลากำหนดแจ้งเตือน ส่งหากลุ่มบอทสนทนา Telegram
 */
function checkTaskReminders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var botToken = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  if (!botToken) {
    // ลองดึงจากชีต Settings
    var settingsSheet = ss.getSheetByName("Settings");
    if (settingsSheet) {
      var rows = settingsSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0].toString() === "TELEGRAM_BOT_TOKEN") {
          botToken = rows[i][1].toString();
          break;
        }
      }
    }
  }
  var chatId = "";
  
  // ดึงสิทธิ์ผู้ส่งล่าสุดที่บันทึกไว้ในชีต Profiles (ค้นหาผู้ที่มีวันที่ลงทะเบียนล่าสุด)
  var usersSheet = ss.getSheetByName("Profiles");
  if (usersSheet && usersSheet.getLastRow() > 1) {
    var rows = usersSheet.getDataRange().getValues();
    var registeredAtColIdx = SHEETS_SCHEMA["Profiles"].indexOf("registered_at");
    var userIdColIdx = SHEETS_SCHEMA["Profiles"].indexOf("user_id");
    
    var latestTime = 0;
    var targetChatId = "";
    
    for (var i = 1; i < rows.length; i++) {
      var dateVal = new Date(rows[i][registeredAtColIdx]).getTime();
      if (dateVal > latestTime) {
        latestTime = dateVal;
        targetChatId = rows[i][userIdColIdx].toString();
      }
    }
    chatId = targetChatId;
  }
  
  if (!chatId) return;
  
  var taskSheet = ss.getSheetByName("Task");
  if (!taskSheet) return;
  
  var taskRows = taskSheet.getDataRange().getValues();
  var headers = taskRows[0];
  var taskNameIdx = headers.indexOf("task_name");
  var statusIdx = headers.indexOf("status");
  var dueDateIdx = headers.indexOf("due_date");
  var reminderTimeIdx = headers.indexOf("reminder_time");
  
  var now = new Date();
  var currentTimeString = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+7", "HH:mm");
  
  for (var i = 1; i < taskRows.length; i++) {
    var row = taskRows[i];
    var status = row[statusIdx];
    var reminderTime = row[reminderTimeIdx] ? row[reminderTimeIdx].toString().trim() : "";
    
    if (status !== "Completed" && reminderTime) {
      // ตรวจสอบถ้าเวลาปัจจุบันของบอสตรงกับช่องตั้งเวลาเตือนภัย
      if (reminderTime.includes(currentTimeString)) {
        var taskName = row[taskNameIdx];
        var dueDate = row[dueDateIdx] || "ด่วนที่สุด";
        
        var msg = "🔔 *แจ้งเตือนทวนความจำรายการงานสะสม*\n\n*งาน*: " + taskName + "\n*กำหนดส่ง*: " + dueDate + "\n\nกรุณาตรวจสอบความคืบหน้าของงานนี้ด้วยครับ";
        
        sendTelegramNotification(botToken, chatId, msg);
      }
    }
  }
}

/**
 * 4. ส่งข้อความแจ้งเตือนหา API บอท Telegram
 */
function sendTelegramNotification(token, chatId, text) {
  var url = "https://api.telegram.org/bot" + token + "/sendMessage";
  var payload = {
    "chat_id": chatId,
    "text": text,
    "parse_mode": "Markdown"
  };
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  UrlFetchApp.fetch(url, options);
}

/**
 * 5. ฟังก์ชันติดตั้งคิวเวลาทำงานเบื้องหลัง (Cron Job Trigger 5 mins)
 */
function setupTimeTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "checkTaskReminders") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("checkTaskReminders")
           .timeBased()
           .everyMinutes(5)
           .create();
           
  // ติดตั้งปฏิทินตรวจเงินรายเดือนด้วย
  try {
    setupMonthlyTrigger();
  } catch (e) {
    Logger.log("Failed to setup monthly trigger: " + e.toString());
  }
}

/**
 * 6. ฟังก์ชันแปลงค่าและพ่นรูปแบบกลับเป็น JSON MimeType มาตรฐาน (Helper)
 */
function createJsonResponse(outputObject) {
  return ContentService.createTextOutput(JSON.stringify(outputObject))
                        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 7. ฟังก์ชันค้นหาหรือสร้างรายการที่ต้องทำใน Google Tasks (Google Tasks API Integration)
 */
function getOrCreateGoogleTaskList() {
  if (typeof Tasks === "undefined") {
    throw new Error("กรุณาเปิดบริการ 'Tasks API' ในเมนู Services ด้านซ้ายของ Google Apps Script ก่อนครับบอส");
  }
  var listTitle = "Little Bro Assistant Tasks";
  try {
    var taskListsRes = Tasks.TaskLists.list();
    var taskLists = taskListsRes.items;
    if (taskLists) {
      for (var i = 0; i < taskLists.length; i++) {
        if (taskLists[i].title === listTitle) {
          return taskLists[i].id;
        }
      }
    }
  } catch (e) {
    // กรณีพึ่งใช้งานครั้งแรกและไม่มีรายการใดเลย หรือ API บล็อก
  }
  
  // สร้างรายการหลักใหม่
  var newList = Tasks.TaskLists.insert({ title: listTitle });
  return newList.id;
}

/**
 * 8. ฟังก์ชันสำหรับกดทดสอบระบบ Google Workspace จากหน้าต่าง Apps Script Editor
 * ช่วยตรวจเช็คสิทธิ์การใช้งาน (Permissions) ของ Calendar, Tasks และ Sheets
 */
function testGoogleWorkspaceIntegration() {
  Logger.log("=== เริ่มต้นการทดสอบระบบ Little Bro Assistant ===");
  
  // 1. ทดสอบการเข้าถึง Spreadsheet
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log("🟢 1. การเชื่อมต่อ Spreadsheet สำเร็จ! ชื่อไฟล์: " + ss.getName());
  } catch (err) {
    Logger.log("❌ 1. การเชื่อมต่อ Spreadsheet ล้มเหลว: " + err.toString());
  }
  
  // 2. ทดสอบระบบ Google Calendar
  try {
    var calendarName = "Little Bro Assistant";
    var cals = CalendarApp.getCalendarsByName(calendarName);
    var cal;
    if (cals.length === 0) {
      cal = CalendarApp.createCalendar(calendarName);
      Logger.log("🟢 2. ทดสอบระบบปฏิทิน: สร้างปฏิทินรองชื่อ '" + calendarName + "' ใหม่สำเร็จ!");
    } else {
      cal = cals[0];
      Logger.log("🟢 2. ทดสอบระบบปฏิทิน: ค้นพบและเชื่อมต่อปฏิทิน '" + calendarName + "' แล้ว!");
    }
  } catch (err) {
    Logger.log("❌ 2. การเชื่อมต่อ Google Calendar ล้มเหลว: " + err.toString());
  }
  
  // 3. ทดสอบระบบ Google Tasks
  try {
    if (typeof Tasks === "undefined") {
      Logger.log("⚠️ 3. ระบบ Google Tasks: ยังไม่เปิดบริการ 'Tasks API' ในส่วน Services (ไม่ผ่าน)");
    } else {
      var listTitle = "Little Bro Assistant Tasks";
      var taskLists = Tasks.TaskLists.list().items;
      var foundListId = null;
      if (taskLists) {
        for (var i = 0; i < taskLists.length; i++) {
          if (taskLists[i].title === listTitle) {
            foundListId = taskLists[i].id;
            break;
          }
        }
      }
      if (!foundListId) {
        var newList = Tasks.TaskLists.insert({ title: listTitle });
        Logger.log("🟢 3. ระบบ Google Tasks: สร้างรายการงาน '" + listTitle + "' ใหม่สำเร็จ!");
      } else {
        Logger.log("🟢 3. ระบบ Google Tasks: ตรวจพบรายการงาน '" + listTitle + "' เรียบร้อยแล้ว!");
      }
    }
  } catch (err) {
    Logger.log("❌ 3. การเชื่อมต่อ Google Tasks ล้มเหลว: " + err.toString());
  }
  
  Logger.log("=== สิ้นสุดการทดสอบระบบ ===");
}

/**
 * 9. ฟังก์ชันตรวจสอบวิเคราะห์สุขภาพการเงินสิ้นเดือน (SET Happy Money Report)
 */
function checkMonthlyFinancialHealth(ssId) {
  var ss = SpreadsheetApp.openById(ssId);
  var financeSheet = ss.getSheetByName("Finance");
  if (!financeSheet) return "ไม่พบชีต 'Finance'";
  
  var rows = financeSheet.getDataRange().getValues();
  var now = new Date();
  var currentMonth = now.getMonth(); // 0-11
  var currentYear = now.getFullYear();
  
  var totalIncome = 0;
  var totalSaving = 0;
  var totalDebt = 0;
  
  for (var i = 1; i < rows.length; i++) {
    var rowTime = rows[i][0];
    if (!rowTime) continue;
    var date = new Date(rowTime);
    if (isNaN(date.getTime())) continue;
    
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      var txType = rows[i][1];
      var category = rows[i][2].toString();
      var amount = Number(rows[i][3]) || 0;
      var desc = rows[i][4].toString();
      
      if (txType === "Income") {
        totalIncome += amount;
      } else if (txType === "Expense") {
        var isSaving = category.indexOf("ออม") !== -1 || category.indexOf("ลงทุน") !== -1 || desc.indexOf("ออม") !== -1 || desc.indexOf("ลงทุน") !== -1;
        var isDebt = category.indexOf("หนี้") !== -1 || category.indexOf("ผ่อน") !== -1 || category.indexOf("กู้") !== -1 || desc.indexOf("หนี้") !== -1 || desc.indexOf("ผ่อน") !== -1;
        
        if (isSaving) {
          totalSaving += amount;
        } else if (isDebt) {
          totalDebt += amount;
        }
      }
    }
  }
  
  var savingRatio = totalIncome > 0 ? (totalSaving / totalIncome) * 100 : 0;
  var debtRatio = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 0;
  
  var grade = "C";
  var advice = "";
  var icon = "📊";
  
  if (totalIncome === 0) {
    grade = "F";
    icon = "🚨";
    advice = "เตือนภัยระดับสีแดงครับบอส! ในเดือนนี้ยังไม่มีการบันทึกรายรับเข้ามาเลยครับ กรุณาบันทึกรายรับเพื่อวิเคราะห์สภาพคล่องที่แท้จริงครับ";
  } else if (savingRatio >= 20 && debtRatio <= 30) {
    grade = "A";
    icon = "🏆";
    advice = "ยอดเยี่ยมที่สุดครับบอส! การเงินแข็งแกร่งมาก ออมเยอะหนี้น้อย สุขภาพการเงินฟิตปั๋งระดับมหาเศรษฐี รักษาวินัยนี้ไว้ครับ!";
  } else if (savingRatio >= 10 && debtRatio <= 40) {
    grade = "B";
    icon = "🌟";
    advice = "ดีมากครับบอส! การเงินอยู่ในระดับแข็งแรง บรรลุเกณฑ์มาตรฐานทั่วไปได้อย่างสบาย มีเงินออมสม่ำเสมอและหนี้สินไม่เกินขอบเขตปลอดภัยครับ";
  } else if (savingRatio >= 5 && debtRatio <= 50) {
    grade = "C";
    icon = "⚖️";
    advice = "พอใช้ได้ครับบอส! สภาพคล่องยังหมุนเวียนได้ แต่แนะนำให้พยายามเพิ่มเปอร์เซ็นต์เงินออมขึ้น หรือหาทางลดการจ่ายหนี้ลงเพื่อความปลอดภัยครับ";
  } else if (savingRatio < 5 && debtRatio <= 55) {
    grade = "D";
    icon = "⚠️";
    advice = "มีความเสี่ยงทางการเงินครับบอส! ยอดเงินออมน้อยเกินเกณฑ์มาตรฐานสะสม (ควรมีอย่างน้อย 10%) แนะนำให้พยายามตัดรายจ่ายฟุ่มเฟือยเพื่อเพิ่มสัดส่วนเงินออมด่วนครับ";
  } else {
    grade = "F";
    icon = "🚨";
    advice = "สภาพคล่องมีปัญหารุนแรงครับบอส! หนี้สินเกิน 50% ของรายได้ และเงินออมต่ำมาก แนะนำให้รีบปรับพอร์ตลดรายจ่าย และหลีกเลี่ยงการก่อหนี้ก้อนใหม่ด่วนที่สุดครับ!";
  }
  
  var monthsThai = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  var monthName = monthsThai[currentMonth];
  var thaiYear = currentYear + 543;
  
  var reportText = "🩺 *รายงานตรวจสุขภาพการเงินสิ้นเดือน (SET Happy Money)*\n" +
                   "📅 ประจำเดือน: *" + monthName + " " + thaiYear + "*\n" +
                   "──────────────────\n" +
                   "📈 *สรุปข้อมูลประจำเดือน*:\n" +
                   "• รายได้รวม: `฿" + totalIncome.toLocaleString("th-TH", { minimumFractionDigits: 2 }) + "`\n" +
                   "• เงินออมสะสม: `฿" + totalSaving.toLocaleString("th-TH", { minimumFractionDigits: 2 }) + "`\n" +
                   "• จ่ายหนี้สิน: `฿" + totalDebt.toLocaleString("th-TH", { minimumFractionDigits: 2 }) + "`\n\n" +
                   "📊 *ดัชนีสุขภาพการเงิน*:\n" +
                   "💰 *Saving Ratio*: `" + savingRatio.toFixed(1) + "%` (เกณฑ์มาตรฐาน >= 10%)\n" +
                   "💳 *Debt Ratio*: `" + debtRatio.toFixed(1) + "%` (เกณฑ์ควบคุม <= 36-45%)\n" +
                   "──────────────────\n" +
                   "👑 *ผลเกรดสุขภาพการเงิน*: " + icon + " *Grade " + grade + "*\n\n" +
                   "📝 *คำแนะนำจากผู้ช่วย*: \n_" + advice + "_";
                   
  return reportText;
}

/**
 * 10. ติดตั้ง Trigger สำหรับรันรายงานอัตโนมัติทุกวันที่ 30 ของเดือน
 */
function setupMonthlyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "runMonthlyFinancialHealthJob") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("runMonthlyFinancialHealthJob")
           .timeBased()
           .onMonthDay(30)
           .atHour(9)
           .create();
}

/**
 * 11. ฟังก์ชันรันบอทวิเคราะห์พ่นรายงานออกหา Telegram
 */
function runMonthlyFinancialHealthJob() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName("Settings");
  
  var botToken = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  if (!botToken && settingsSheet) {
    var rows = settingsSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === "TELEGRAM_BOT_TOKEN") {
        botToken = rows[i][1].toString();
        break;
      }
    }
  }
  
  if (!botToken) return;
  
  var profilesSheet = ss.getSheetByName("Profiles");
  if (!profilesSheet) return;
  
  var rows = profilesSheet.getDataRange().getValues();
  var userIdColIdx = SHEETS_SCHEMA["Profiles"].indexOf("user_id");
  if (userIdColIdx === -1) return;
  
  var reportText = checkMonthlyFinancialHealth(ss.getId());
  
  for (var i = 1; i < rows.length; i++) {
    var chatId = rows[i][userIdColIdx].toString();
    if (chatId) {
      sendTelegramNotification(botToken, chatId, reportText);
    }
  }
}