// app.js - Main Client Application Logic & UI Controller
import { firebaseService } from './firebase-config.js';
// Setup global references for debugging/dev
window.firebaseService = firebaseService;
// Current Date configuration matching system settings
const today = new Date();

const CURRENT_DATE_STR = today.toISOString().split("T")[0];

const [CURRENT_YEAR, CURRENT_MONTH, CURRENT_DAY] =
  CURRENT_DATE_STR.split("-").map(Number);

const CURRENT_YEAR_MONTH =
  today.getFullYear() +
  "-" +
  String(today.getMonth() + 1).padStart(2, "0");

// Global exports
export const appConfig = {
  currentDate: CURRENT_DATE_STR,
  currentYearMonth: CURRENT_YEAR_MONTH
};
// ==========================================
//           SECURE ROUTE PROTECTION
// ==========================================
export async function checkAuthState(redirectOnUnauth = true) {
  return new Promise((resolve) => {
    firebaseService.onAuthChanged((teacher) => {
      if (!teacher) {
        if (redirectOnUnauth) {
          console.log("Unauthorized user. Redirecting to login page...");
          window.location.href = "/login";
        }
        resolve(null);
      } else {
        // Load UI components if user is authorized
        initTheme();
        renderSharedUI(teacher);
        resolve(teacher);
      }
    });
  });
}
// ==========================================
//          FEE CALCULATION UTILITY
// ==========================================
// Automatically calculates pending months & due amount
// e.g. "Rahul Kumar - Pending for 2 Months - ₹3000 Due"
export function calculateDues(student) {
    const monthlyFee = Number(student.monthlyFee) || 0;

    // Student has no joining date
    if (!student.joiningDate) {
        return {
            pendingMonths: 0,
            dueAmount: 0,
            status: "Paid",
            dueMonthsList: [],
            billingCycles: [],
            text: `${student.name} - All Dues Paid`
        };
    }

    // Helper: parse YYYY-MM-DD safely in local time
    function parseLocalDate(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    // Helper: format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    // Helper: add one month while keeping the billing day valid
    function addOneMonth(date) {
        const originalDay = date.getDate();

        const nextDate = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            1
        );

        const lastDayOfTargetMonth = new Date(
            nextDate.getFullYear(),
            nextDate.getMonth() + 1,
            0
        ).getDate();

        nextDate.setDate(
            Math.min(originalDay, lastDayOfTargetMonth)
        );

        return nextDate;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /*
     * nextDueDate means:
     *
     * Joining: 15 July
     * First cycle: 15 July → 15 August
     * nextDueDate: 15 August
     */

   let nextDueDate;

// Billing should start from the student's joining date.
// If some months are already paid, start from the month after
// the latest paid month.
if (student.lastFeePaidMonth) {
    const [paidYear, paidMonth] = student.lastFeePaidMonth
        .split("-")
        .map(Number);

    // Keep the original joining day
    const joiningDay = parseLocalDate(student.joiningDate).getDate();

    nextDueDate = new Date(paidYear, paidMonth - 1, joiningDay);
    nextDueDate = addOneMonth(nextDueDate);
} else {
    // No fee paid yet → first billing cycle starts from joining date
    nextDueDate = parseLocalDate(student.joiningDate);
}

nextDueDate.setHours(0, 0, 0, 0);

const billingCycles = [];

// Generate every unpaid billing cycle starting from the joining date.
// The current month is also pending immediately after joining.
let cycleFrom = new Date(nextDueDate);

while (today >= cycleFrom) {

    const cycleTo = addOneMonth(cycleFrom);

    billingCycles.push({
        from: formatDate(cycleFrom),
        to: formatDate(cycleTo),
        label: `${formatDate(cycleFrom)} → ${formatDate(cycleTo)}`
    });

    cycleFrom = cycleTo;
}

    const pendingMonthsCount = billingCycles.length;
    const pendingAmount = pendingMonthsCount * monthlyFee;

    let status = "Paid";

    if (pendingMonthsCount === 1) {
        status = "Pending";
    } else if (pendingMonthsCount >= 2) {
        status = "Overdue";
    }

    return {
        pendingMonths: pendingMonthsCount,
        dueAmount: pendingAmount,
        status: status,

        // Temporary compatibility with existing fees.html
        dueMonthsList: billingCycles.map(
            cycle => cycle.to.substring(0, 7)
        ),

        // New billing-cycle data
        billingCycles: billingCycles,

        nextDueDate: formatDate(nextDueDate),

        text:
            pendingMonthsCount > 0
                ? `${student.name} - Pending for ${pendingMonthsCount} Month${pendingMonthsCount > 1 ? "s" : ""} - ₹${pendingAmount} Due`
                : `${student.name} - All Dues Paid`
    };
}
// Generate pre-written Whatsapp message URL
export function getWhatsAppReminderLink(student, dueInfo, teacher) {
 
  const message = `Hello, this is a reminder that ${student.name}'s fee for ${dueInfo.pendingMonths} month${dueInfo.pendingMonths > 1 ? 's' : ''} is pending. Kindly clear the dues of ₹${dueInfo.dueAmount} at your earliest convenience.${teacher?.upiId ? `\n\nUPI ID: ${teacher.upiId}` : ""}`;
  
  const encodedText = encodeURIComponent(message);
  // Ensure we clean phone number
  const rawMobile = student.parentMobile || student.mobile || "";
  const cleanMobile = rawMobile.replace(/\D/g, "");
  // Pad with India prefix 91 if length is 10 digits
  const finalMobile = cleanMobile.length === 10 ? "91" + cleanMobile : cleanMobile;
  return `https://wa.me/${finalMobile}?text=${encodedText}`;
}
// ==========================================
//          THEME CONTROLLER (Light/Dark)
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeTogglerIcon(savedTheme);
}
function updateThemeTogglerIcon(theme) {
  const icon = document.getElementById("themeIcon");
  if (!icon) return;
  if (theme === "dark") {
    icon.className = "bi bi-sun-fill";
  } else {
    icon.className = "bi bi-moon-fill";
  }
}
export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeTogglerIcon(newTheme);
}
// ==========================================
//          SHARED LAYOUT RENDERER
// ==========================================
function renderSharedUI(teacher) {
  // Check if sidebar structure exists
  const sidebarContainer = document.getElementById("sidebarContainer");
  if (sidebarContainer) {
    const activePage = window.location.pathname.split("/").pop() || "dashboard.html";
    
    sidebarContainer.innerHTML = `
      <div class="sidebar" id="mainSidebar">
        <div class="sidebar-logo">
          <i class="bi bi-journal-bookmark-fill text-primary me-2"></i>
          <span>Fuzion Portal</span>
        </div>
        <ul class="sidebar-menu">
          <li class="sidebar-item">
            <a href="/dashboard" class="sidebar-link ${activePage === 'dashboard.html' ? 'active' : ''}">
              <i class="bi bi-grid-1x2-fill"></i> Dashboard
            </a>
          </li>
          <li class="sidebar-item">
            <a href="/students" class="sidebar-link ${activePage === 'students.html' ? 'active' : ''}">
              <i class="bi bi-people-fill"></i> Student Roster
            </a>
          </li>
          <li class="sidebar-item">
            <a href="/attendance" class="sidebar-link ${activePage === 'attendance.html' ? 'active' : ''}">
              <i class="bi bi-calendar2-check-fill"></i> Attendance
            </a>
          </li>
          <li class="sidebar-item">
            <a href="/fees" class="sidebar-link ${activePage === 'fees.html' ? 'active' : ''}">
              <i class="bi bi-currency-rupee"></i> Fee Ledger
            </a>
          </li>
          <li class="sidebar-item">
            <a href="/reports" class="sidebar-link ${activePage === 'reports.html' ? 'active' : ''}">
              <i class="bi bi-bar-chart-line-fill"></i> Reports
            </a>
          </li>
        </ul>
        <div class="p-3 border-top border-color-sidebar mt-auto">
          <div class="d-flex align-items-center mb-3">
            <div class="rounded-circle bg-primary-light d-flex align-items-center justify-content-center text-primary fw-bold" style="width: 40px; height: 40px;">
              ${teacher.name.charAt(0).toUpperCase()}
            </div>
            <div class="ms-3 overflow-hidden">
              <h6 class="text-white mb-0 text-truncate" style="font-size: 0.9rem;">${teacher.name}</h6>
              <span class="text-muted small text-truncate d-block" style="font-size: 0.75rem;">${teacher.schoolName}</span>
            </div>
          </div>
          <button id="logoutBtn" class="btn btn-outline-danger btn-sm w-100 rounded-pill">
            <i class="bi bi-box-arrow-right me-1"></i> Log Out
          </button>
        </div>
      </div>
    `;
    // Hook up logout action
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      if (confirm("Are you sure you want to log out?")) {
        await firebaseService.logoutTeacher();
       // window.location.href = "login.html";
         window.location.href = "/login";
      }
    });
  }
  // Render Top Header Navbar contents dynamically
  const headerNavbar = document.getElementById("headerNavbar");
  if (headerNavbar) {
    const currentDate = new Date().toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric"
});
    headerNavbar.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm d-lg-none text-secondary" id="sidebarToggle" style="font-size: 1.5rem;">
          <i class="bi bi-list"></i>
        </button>
       <div class="d-none d-md-flex align-items-center text-secondary small bg-light px-3 py-2 rounded-pill">
          <i class="bi bi-calendar3 me-2"></i>
          <span>Academic Date: <strong>${currentDate}</strong></span>
      </div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <!-- Theme Switcher -->
        <button id="headerThemeToggle" class="theme-toggle-btn" title="Toggle Theme">
          <i class="bi bi-moon-fill" id="themeIcon"></i>
        </button>
        <!-- Notification Bell -->
        <div class="dropdown">
          <div class="notification-bell" id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-bell-fill"></i>
            <span class="notification-badge d-none" id="bellBadge"></span>
          </div>
          <ul class="dropdown-menu dropdown-menu-end shadow border-0 py-2" aria-labelledby="notificationDropdown" style="width: 320px; border-radius: var(--radius-md);" id="notificationContainer">
            <li class="px-3 py-2 border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="m-0 fw-bold">Recent Alerts</h6>
                <span class="badge bg-danger-light text-danger small" id="alertCountBadge">0 New</span>
              </div>
            </li>
            <div id="alertsList" style="max-height: 250px; overflow-y: auto;">
              <!-- Dynamic alert items -->
              <li class="text-center py-4 text-muted small">
                <i class="bi bi-bell-slash d-block fs-3 mb-2"></i> No active notifications
              </li>
            </div>
          </ul>
        </div>
        <!-- Logged Teacher Profile Quick Link -->
        <div class="d-flex align-items-center">
          <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style="width: 38px; height: 38px;">
            ${teacher.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    `;
    // Hook up responsive sidebar toggle
    const toggle = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("mainSidebar");
    if (toggle && sidebar) {
      toggle.addEventListener("click", () => {
        console.log("Toggle clicked");
        sidebar.classList.toggle("show");
        console.log(sidebar.className);
        });
    }
    // Hook up header theme toggle
    const headerThemeToggle = document.getElementById("headerThemeToggle");
    if (headerThemeToggle) {
      headerThemeToggle.addEventListener("click", () => {
        toggleTheme();
      });
    }
    // Initialize Theme Toggler Icons
    initTheme();
    // Trigger Notification System Loading
    loadNotifications();
  }
  // Check Mock Mode Banner
  const banner = document.getElementById("demoBanner");
  if (banner && window.isMockMode) {
    banner.style.display = "block";
  }
}
// ==========================================
//          NOTIFICATION SYSTEM
// ==========================================
async function loadNotifications() {
  const alertsList = document.getElementById("alertsList");
  const bellBadge = document.getElementById("bellBadge");
  const alertCountBadge = document.getElementById("alertCountBadge");
  
  if (!alertsList) return;
  try {
    const students = await firebaseService.getStudents();
    const attendanceHistory = await firebaseService.getAttendanceHistory();
    
    const notifications = [];
    // 1. Check for Overdue Fees
    let overdueCount = 0;
    students.forEach(s => {
      const dueInfo = calculateDues(s);
      if (dueInfo.status === "Overdue") {
        overdueCount++;
        notifications.push({
          type: "danger",
          icon: "bi-exclamation-triangle-fill",
          title: "Overdue Dues Notice",
          message: `${s.name} is overdue for ${dueInfo.pendingMonths} months (₹${dueInfo.dueAmount} due).`,
          link: "/fees"
        });
      }
    });
    // 2. Check for Fees Due Today (Mock Date: 2026-06-01)
    // Assume fees are due monthly on the joining date day.
    const todayDay = CURRENT_DAY;
    students.forEach(s => {
      const joinDay = Number(s.joiningDate.split("-")[2]) || 1;
      const dueInfo = calculateDues(s);
      if (joinDay === todayDay && dueInfo.dueAmount > 0) {
        notifications.push({
          type: "warning",
          icon: "bi-calendar-event-fill",
          title: "Fees Due Today",
          message: `Monthly fee for ${s.name} is due today (₹${s.monthlyFee}).`,
          link: "/fees"
        });
      }
    });
    // 3. Check if Attendance has not been marked today
    const hasAttendanceToday = attendanceHistory.some(a => a.date === CURRENT_DATE_STR);
    if (!hasAttendanceToday) {
      notifications.push({
        type: "info",
        icon: "bi-calendar2-x-fill",
        title: "Attendance Check",
        message: "Attendance has not been marked for today yet.",
        link: "/attendance"
      });
    }
    // Render Notifications
    if (notifications.length > 0) {
      bellBadge.classList.remove("d-none");
      alertCountBadge.textContent = `${notifications.length} Alerts`;
      alertCountBadge.className = "badge bg-danger text-white small";
      alertsList.innerHTML = notifications.map(n => `
        <li>
          <a class="dropdown-item px-3 py-2.5 border-bottom d-flex align-items-start gap-3 text-wrap" href="${n.link}">
            <div class="rounded bg-${n.type}-light text-${n.type} d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; flex-shrink: 0;">
              <i class="bi ${n.icon}"></i>
            </div>
            <div>
              <p class="mb-0 fw-semibold text-dark small" style="line-height: 1.3;">${n.title}</p>
              <p class="mb-0 text-muted small mt-0.5" style="font-size: 0.75rem; line-height: 1.3;">${n.message}</p>
            </div>
          </a>
        </li>
      `).join("");
    } else {
      bellBadge.classList.add("d-none");
      alertCountBadge.textContent = "0 New";
      alertCountBadge.className = "badge bg-success-light text-success small";
      alertsList.innerHTML = `
        <li class="text-center py-4 text-muted small">
          <i class="bi bi-check2-circle d-block fs-3 mb-2 text-success"></i> All systems operational
        </li>
      `;
    }
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}
// ==========================================
//          TOAST NOTIFICATION TRIGGER
// ==========================================
export function showToast(message, type = "success") {
  // Create toast container dynamically if not exists
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    container.style.zIndex = "1090";
    document.body.appendChild(container);
  }
  const toastId = "toast-" + Math.random().toString(36).substr(2, 9);
  const icon = type === "success" 
    ? "bi-check-circle-fill text-success" 
    : type === "danger" 
      ? "bi-exclamation-octagon-fill text-danger" 
      : "bi-info-circle-fill text-info";
  const html = `
    <div id="${toastId}" class="toast align-items-center border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true" style="border-radius: var(--radius-md);">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon} fs-5"></i>
          <span class="text-dark small fw-medium">${message}</span>
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
  const element = document.getElementById(toastId);
  const bootstrapToast = new bootstrap.Toast(element, { delay: 4000 });
  bootstrapToast.show();
  // Remove element after hidden
  element.addEventListener("hidden.bs.toast", () => {
    element.remove();
  });
}
