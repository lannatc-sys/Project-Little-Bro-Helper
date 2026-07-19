function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var ssId = requestData.spreadsheet_id;
    
    if (!ssId) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Missing spreadsheet_id" }))
                            .setMimeType(ContentService.MimeType.JSON);
    }
    
    var ss = SpreadsheetApp.openById(ssId);
    
    if (action === "initialize_workspace") {
      initializeUserSheets(ssId);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "เริ่มต้นพื้นที่ทำงานและสร้างตารางฐานข้อมูลเรียบร้อยแล้ว" }))
                            .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "add_expense" || action === "add_income") {
      var sheet = ss.getSheetByName("Finance");
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "ไม่พบตาราง Finance กรุณาทำการตั้งค่าเริ่มต้นพื้นที่ทำงานก่อน" }))
                              .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Mapping fields into Fixed Layout Columns:
      // timestamp | transaction_type | category | amount | description | file_attachment_url
      sheet.appendRow([
        new Date(),
        requestData.transaction_type, // "Expense" or "Income"
        requestData.category,
        Number(requestData.amount),
        requestData.description,
        requestData.file_attachment_url || ""
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "บันทึกธุรกรรมเรียบร้อย" }))
                            .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Action not recognized" }))
                          .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
                          .setMimeType(ContentService.MimeType.JSON);
  }
}

function initializeUserSheets(spreadsheetId) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  
  // กำหนดชื่อชีตและหัวตารางภาษาอังกฤษ 100%
  var sheetsLayout = {
    "Users": ["user_id", "telegram_username", "google_email", "registered_at"],
    "Finance": ["timestamp", "transaction_type", "category", "amount", "description", "file_attachment_url"],
    "Task": ["task_id", "task_name", "details", "status", "due_date", "reminder_time"],
    "Calendar": ["event_id", "event_title", "start_time", "end_time", "location", "notes"],
    "Customer": ["customer_id", "full_name", "phone_number", "email", "contact_info"],
    "Settings": ["setting_key", "setting_value"]
  };
  
  for (var sheetName in sheetsLayout) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear(); // ล้างข้อมูลและรูปแบบเก่า
      sheet.clearFormats();
    }
    
    var numCols = sheetsLayout[sheetName].length;
    var headerRange = sheet.getRange(1, 1, 1, numCols);
    
    // เขียนหัวข้อภาษาอังกฤษลงแถวที่ 1
    headerRange.setValues([sheetsLayout[sheetName]]);
    
    // ตกแต่งตารางรูปแบบสวยงาม (Premium Styling)
    headerRange.setFontWeight("bold")
               .setBackground("#1f4e78") // สีน้ำเงินสเลทเข้ม
               .setFontColor("#ffffff")   // ตัวอักษรสีขาว
               .setHorizontalAlignment("center")
               .setVerticalAlignment("middle");
               
    sheet.setFrozenRows(1); // ล็อกแถวแรกไว้
    sheet.setRowHeight(1, 28); // ขยายความสูงแถวหัวข้อ
    
    // ตั้งค่าขนาดคอลัมน์อัตโนมัติตามความยาวของเนื้อหา
    sheet.autoResizeColumns(1, numCols);
  }
}
