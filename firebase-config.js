// firebase-config.js - Database and Authentication Service Layer
// Supports real Firebase integration & automatic Mock Fallback (Demo Mode)
// --- Firebase Configuration ---
// Paste your actual Firebase project configuration here to switch to live database mode.
const firebaseConfig = {
  apiKey: "AIzaSyATQLrCdu9BUHOwWUeD80QzyGgjdw1_mUA",
  authDomain: "teacher-management-ccffe.firebaseapp.com",
  projectId: "teacher-management-ccffe",
  storageBucket: "teacher-management-ccffe.firebasestorage.app",
  messagingSenderId: "1086863318713",
  appId: "1:1086863318713:web:ae67f29839345ee8eb4568"
};
// Check if credentials are still placeholder values
const isMockMode = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_API_KEY");
// Global indicator to display a demo banner on pages
window.isMockMode = isMockMode;
let authInstance = null;
let dbInstance = null;
// Dynamic SDK loader for real Firebase
let firebaseAppModule, firebaseAuthModule, firebaseFirestoreModule;
async function initRealFirebase() {
  try {
    // Import SDKs dynamically to avoid loading failures if offline or blocked
    firebaseAppModule = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
    firebaseFirestoreModule = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const app = firebaseAppModule.initializeApp(firebaseConfig);
    authInstance = firebaseAuthModule.getAuth(app);
    dbInstance = firebaseFirestoreModule.getFirestore(app);
    console.log("Firebase initialized successfully in live mode.");
  } catch (error) {
    console.error("Failed to initialize live Firebase. Falling back to Mock Mode.", error);
    window.isMockMode = true;
  }
}
// Ensure database initialization is complete before performing DB actions in live mode
const initPromise = isMockMode ? Promise.resolve() : initRealFirebase();
// ==========================================
//           MOCK IMPLEMENTATION (Demo)
// ==========================================
const MOCK_DB = {
  get: (key) => JSON.parse(localStorage.getItem(key)) || [],
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  
  initializeMockData() {
    if (localStorage.getItem("mock_initialized")) return;
    // Default Teacher
    const defaultTeacher = {
      uid: "mock-teacher-123",
      name: "Aditya Sharma",
      email: "teacher@demo.com",
      schoolName: "Apex Classes",
      createdAt: new Date().toISOString()
    };
    this.set("mock_teachers", [defaultTeacher]);
    this.set("mock_currentUser", defaultTeacher);
    // Default Students (Joining in March/April 2026, current date is 2026-06-01)
    const mockStudents = [
      {
        id: "stud-1",
        teacherId: "mock-teacher-123",
        name: "Rahul Kumar",
        mobile: "9876543210",
        parentName: "Sanjay Kumar",
        parentMobile: "9876543211",
        class: "Class 10",
        subject: "Mathematics",
        joiningDate: "2026-03-10",
        monthlyFee: 1500,
        lastFeePaidMonth: "2026-03", // Due for April & May, total ₹3000
        performanceRating: "Good",
        status: "Active",
        notes: "Needs practice in Algebra. Consistent student."
      },
      {
        id: "stud-2",
        teacherId: "mock-teacher-123",
        name: "Priya Patel",
        mobile: "8765432109",
        parentName: "Amit Patel",
        parentMobile: "8765432108",
        class: "Class 12",
        subject: "Physics",
        joiningDate: "2026-02-05",
        monthlyFee: 2000,
        lastFeePaidMonth: "2026-05", // Paid, no overdue
        performanceRating: "Excellent",
        status: "Active",
        notes: "Top scorer. Highly analytical mind."
      },
      {
        id: "stud-3",
        teacherId: "mock-teacher-123",
        name: "Aman Verma",
        mobile: "7654321098",
        parentName: "Rajesh Verma",
        parentMobile: "7654321097",
        class: "Class 10",
        subject: "Science",
        joiningDate: "2026-01-15",
        monthlyFee: 1200,
        lastFeePaidMonth: "2026-05", // Paid, no overdue
        performanceRating: "Average",
        status: "Active",
        notes: "Good performance in labs, needs improvement in theory."
      },
      {
        id: "stud-4",
        teacherId: "mock-teacher-123",
        name: "Sneha Reddy",
        mobile: "9988776655",
        parentName: "K. Reddy",
        parentMobile: "9988776654",
        class: "Class 11",
        subject: "Chemistry",
        joiningDate: "2025-11-20",
        monthlyFee: 1800,
        lastFeePaidMonth: "2026-02", // Overdue 3 months (March, April, May) - ₹5400 Due
        performanceRating: "Needs Improvement",
        status: "Active",
        notes: "Frequently irregular. Needs regular monitoring."
      },
      {
        id: "stud-5",
        teacherId: "mock-teacher-123",
        name: "Kabir Mehta",
        mobile: "9123456789",
        parentName: "Sunil Mehta",
        parentMobile: "9123456780",
        class: "Class 9",
        subject: "English",
        joiningDate: "2026-04-01",
        monthlyFee: 1000,
        lastFeePaidMonth: "2026-05", // Paid
        performanceRating: "Average",
        status: "Active",
        notes: "Participates actively in literature reading."
      }
    ];
    this.set("mock_students", mockStudents);
    // Default Fee Payments History
    const mockFees = [
      { id: "fee-1", studentId: "stud-1", teacherId: "mock-teacher-123", datePaid: "2026-03-12", amount: 1500, monthsCovered: ["2026-03"], remarks: "Admission Fee + March Month" },
      { id: "fee-2", studentId: "stud-2", teacherId: "mock-teacher-123", datePaid: "2026-02-06", amount: 2000, monthsCovered: ["2026-02"], remarks: "Paid by Cash" },
      { id: "fee-3", studentId: "stud-2", teacherId: "mock-teacher-123", datePaid: "2026-03-05", amount: 2000, monthsCovered: ["2026-03"], remarks: "Online transfer" },
      { id: "fee-4", studentId: "stud-2", teacherId: "mock-teacher-123", datePaid: "2026-04-05", amount: 2000, monthsCovered: ["2026-04"], remarks: "Online transfer" },
      { id: "fee-5", studentId: "stud-2", teacherId: "mock-teacher-123", datePaid: "2026-05-07", amount: 2000, monthsCovered: ["2026-05"], remarks: "Online transfer" },
      { id: "fee-6", studentId: "stud-3", teacherId: "mock-teacher-123", datePaid: "2026-05-15", amount: 2400, monthsCovered: ["2026-04", "2026-05"], remarks: "Cleared pending and current" },
      { id: "fee-7", studentId: "stud-4", teacherId: "mock-teacher-123", datePaid: "2026-02-22", amount: 1800, monthsCovered: ["2026-02"], remarks: "Cheque bounce cleared later" },
      { id: "fee-8", studentId: "stud-5", teacherId: "mock-teacher-123", datePaid: "2026-04-05", amount: 1000, monthsCovered: ["2026-04"], remarks: "Paid in full" },
      { id: "fee-9", studentId: "stud-5", teacherId: "mock-teacher-123", datePaid: "2026-05-02", amount: 1000, monthsCovered: ["2026-05"], remarks: "Paid early" }
    ];
    this.set("mock_fees", mockFees);
    // Default Attendance (Last few days in May 2026)
    const mockAttendance = [
      { id: "att-1", studentId: "stud-1", teacherId: "mock-teacher-123", date: "2026-05-28", status: "Present" },
      { id: "att-2", studentId: "stud-2", teacherId: "mock-teacher-123", date: "2026-05-28", status: "Present" },
      { id: "att-3", studentId: "stud-3", teacherId: "mock-teacher-123", date: "2026-05-28", status: "Present" },
      { id: "att-4", studentId: "stud-4", teacherId: "mock-teacher-123", date: "2026-05-28", status: "Absent" },
      { id: "att-5", studentId: "stud-5", teacherId: "mock-teacher-123", date: "2026-05-28", status: "Present" },
      { id: "att-6", studentId: "stud-1", teacherId: "mock-teacher-123", date: "2026-05-29", status: "Present" },
      { id: "att-7", studentId: "stud-2", teacherId: "mock-teacher-123", date: "2026-05-29", status: "Present" },
      { id: "att-8", studentId: "stud-3", teacherId: "mock-teacher-123", date: "2026-05-29", status: "Absent" },
      { id: "att-9", studentId: "stud-4", teacherId: "mock-teacher-123", date: "2026-05-29", status: "Absent" },
      { id: "att-10", studentId: "stud-5", teacherId: "mock-teacher-123", date: "2026-05-29", status: "Present" }
    ];
    this.set("mock_attendance", mockAttendance);
    // Default Test Scores (Performance records)
    const mockPerf = [
      { id: "perf-1", studentId: "stud-1", teacherId: "mock-teacher-123", date: "2026-04-15", assessmentName: "Algebra Midtest", score: 72, maxScore: 100, remarks: "Good start, needs improvement in equations.", rating: "Good" },
      { id: "perf-2", studentId: "stud-2", teacherId: "mock-teacher-123", date: "2026-04-18", assessmentName: "Kinematics Quiz", score: 98, maxScore: 100, remarks: "Perfect answers. Clean working.", rating: "Excellent" },
      { id: "perf-3", studentId: "stud-3", teacherId: "mock-teacher-123", date: "2026-04-20", assessmentName: "Cell Biology Test", score: 65, maxScore: 100, remarks: "Below potential. Focus on diagrams.", rating: "Average" },
      { id: "perf-4", studentId: "stud-4", teacherId: "mock-teacher-123", date: "2026-04-22", assessmentName: "Organic Chem Test", score: 48, maxScore: 100, remarks: "Needs immediate doubt clearing. Very poor score.", rating: "Needs Improvement" }
    ];
    this.set("mock_performance", mockPerf);
    localStorage.setItem("mock_initialized", "true");
  }
};
// Auto initialize mock database
if (isMockMode) {
  MOCK_DB.initializeMockData();
}
// ==========================================
//        CENTRAL SERVICE INTERFACE
// ==========================================
export const firebaseService = {
  // --- AUTH SERVICES ---
  async registerTeacher(email, password, name, schoolName) {
    await initPromise;
    if (window.isMockMode) {
      const teachers = MOCK_DB.get("mock_teachers");
      if (teachers.some(t => t.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already registered.");
      }
      const newTeacher = {
        uid: "mock-teacher-" + Math.random().toString(36).substr(2, 9),
        name,
        email,
        schoolName,
        createdAt: new Date().toISOString()
      };
      teachers.push(newTeacher);
      MOCK_DB.set("mock_teachers", teachers);
      MOCK_DB.set("mock_currentUser", newTeacher);
      return newTeacher;
    } else {
      // const cred = await firebaseAuthModule.createUserWithEmailAndPassword(authInstance, email, password);

      const { createUserWithEmailAndPassword } = firebaseAuthModule;

    const cred = await createUserWithEmailAndPassword(
      authInstance,
      email,
      password
  );
      const teacherData = {
        uid: cred.user.uid,
        name,
        email,
        schoolName,
        createdAt: new Date().toISOString()
      };
      await firebaseFirestoreModule.setDoc(
        firebaseFirestoreModule.doc(dbInstance, "teachers", cred.user.uid),
        teacherData
      );
      return teacherData;
    }
  },
  async loginTeacher(email, password) {
    await initPromise;
    if (window.isMockMode) {
      const teachers = MOCK_DB.get("mock_teachers");
      const teacher = teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
      if (!teacher) {
        throw new Error("Invalid credentials or user not found.");
      }
      MOCK_DB.set("mock_currentUser", teacher);
      return teacher;
    } else {
      //const cred = await firebaseAuthModule.signInWithEmailAndPassword(authInstance, email, password);
      const { signInWithEmailAndPassword } = firebaseAuthModule;

      const cred = await signInWithEmailAndPassword(
        authInstance,
        email,
        password
      );
      const docSnap = await firebaseFirestoreModule.getDoc(
        firebaseFirestoreModule.doc(dbInstance, "teachers", cred.user.uid)
      );
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        throw new Error("Teacher profile does not exist in database.");
      }
    }
  },
  async logoutTeacher() {
    await initPromise;
    if (window.isMockMode) {
      localStorage.removeItem("mock_currentUser");
      return true;
    } else {
      await firebaseAuthModule.signOut(authInstance);
      return true;
    }
  },
  async onAuthChanged(callback) {
    await initPromise;
    if (window.isMockMode) {
      // Return currently logged-in user in mock database
      setTimeout(() => {
        const user = MOCK_DB.get("mock_currentUser");
        callback(user || null);
      }, 100);
    } else {
      firebaseAuthModule.onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          const docSnap = await firebaseFirestoreModule.getDoc(
            firebaseFirestoreModule.doc(dbInstance, "teachers", user.uid)
          );
          if (docSnap.exists()) {
            callback(docSnap.data());
          } else {
            callback(null);
          }
        } else {
          callback(null);
        }
      });
    }
  },
  async getCurrentTeacher() {
    await initPromise;
    if (window.isMockMode) {
      return MOCK_DB.get("mock_currentUser");
    } else {
      const user = authInstance.currentUser;
      if (!user) return null;
      const docSnap = await firebaseFirestoreModule.getDoc(
        firebaseFirestoreModule.doc(dbInstance, "teachers", user.uid)
      );
      return docSnap.exists() ? docSnap.data() : null;
    }
  },
  async sendPasswordReset(email) {
    await initPromise;
    if (window.isMockMode) {
      const teachers = MOCK_DB.get("mock_teachers");
      const teacherExists = teachers.some(t => t.email.toLowerCase() === email.toLowerCase());
      if (!teacherExists) {
        throw new Error("Email not found.");
      }
      return "Mock password reset email sent successfully!";
    } else {
      await firebaseAuthModule.sendPasswordResetEmail(authInstance, email);
      return "Password reset email sent successfully!";
    }
  },
  // --- STUDENT SERVICES ---
  async getStudents() {
    await initPromise;
    const teacher = await this.getCurrentTeacher();
    if (!teacher) throw new Error("Unauthorized.");
    if (window.isMockMode) {
      const students = MOCK_DB.get("mock_students");
      return students.filter(s => s.teacherId === teacher.uid);
    } else {
      const q = firebaseFirestoreModule.query(
        firebaseFirestoreModule.collection(dbInstance, "students"),
        firebaseFirestoreModule.where("teacherId", "==", teacher.uid)
      );
      const querySnapshot = await firebaseFirestoreModule.getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }
  },
  async addStudent(studentData) {
    await initPromise;
    const teacher = await this.getCurrentTeacher();
    if (!teacher) throw new Error("Unauthorized.");
    const newStudent = {
      ...studentData,
      teacherId: teacher.uid,
      status: "Active"
    };
    if (window.isMockMode) {
      const students = MOCK_DB.get("mock_students");
      newStudent.id = "stud-" + Math.random().toString(36).substr(2, 9);
      students.push(newStudent);
      MOCK_DB.set("mock_students", students);
      return newStudent;
    } else {
      const docRef = await firebaseFirestoreModule.addDoc(
        firebaseFirestoreModule.collection(dbInstance, "students"),
        newStudent
      );
      newStudent.id = docRef.id;
      return newStudent;
    }
  },
  async updateStudent(studentId, updatedData) {
    await initPromise;
    if (window.isMockMode) {
      const students = MOCK_DB.get("mock_students");
      const index = students.findIndex(s => s.id === studentId);
      if (index === -1) throw new Error("Student not found.");
      students[index] = { ...students[index], ...updatedData };
      MOCK_DB.set("mock_students", students);
      return students[index];
    } else {
      const docRef = firebaseFirestoreModule.doc(dbInstance, "students", studentId);
      await firebaseFirestoreModule.updateDoc(docRef, updatedData);
      return { id: studentId, ...updatedData };
    }
  },
  async deleteStudent(studentId) {
    await initPromise;
    if (window.isMockMode) {
      let students = MOCK_DB.get("mock_students");
      students = students.filter(s => s.id !== studentId);
      MOCK_DB.set("mock_students", students);
      // Clean up linked data
      let fees = MOCK_DB.get("mock_fees");
      MOCK_DB.set("mock_fees", fees.filter(f => f.studentId !== studentId));
      let att = MOCK_DB.get("mock_attendance");
      MOCK_DB.set("mock_attendance", att.filter(a => a.studentId !== studentId));
      let perf = MOCK_DB.get("mock_performance");
      MOCK_DB.set("mock_performance", perf.filter(p => p.studentId !== studentId));
      return true;
    } else {
      // In live database mode, delete doc
      await firebaseFirestoreModule.deleteDoc(firebaseFirestoreModule.doc(dbInstance, "students", studentId));
      
      // Secondary queries would delete subdocuments manually or batch trigger in real systems.
      // We will perform basic cleanup for a robust codebase.
      const collectionsToClean = ["fees", "attendance", "performance"];
      for (const colName of collectionsToClean) {
        const q = firebaseFirestoreModule.query(
          firebaseFirestoreModule.collection(dbInstance, colName),
          firebaseFirestoreModule.where("studentId", "==", studentId)
        );
        const qSnap = await firebaseFirestoreModule.getDocs(q);
        qSnap.forEach(async doc => {
          await firebaseFirestoreModule.deleteDoc(doc.ref);
        });
      }
      return true;
    }
  },
  // --- ATTENDANCE SERVICES ---
  async saveAttendance(date, classId, subject, records) {
    await initPromise;
    const teacher = await this.getCurrentTeacher();
    if (!teacher) throw new Error("Unauthorized.");
    if (window.isMockMode) {
      let att = MOCK_DB.get("mock_attendance");
      // Remove existing attendance records for this date/class/subject combination to prevent duplicates
      const studentIds = records.map(r => r.studentId);
      att = att.filter(a => !(a.date === date && studentIds.includes(a.studentId)));
      // Add new records
      records.forEach(rec => {
        att.push({
          id: "att-" + Math.random().toString(36).substr(2, 9),
          studentId: rec.studentId,
          teacherId: teacher.uid,
          date,
          status: rec.status // Present, Absent, Late
        });
      });
      MOCK_DB.set("mock_attendance", att);
      
      // Update attendance percentage on students dynamically
      await this.recalculateAttendancePercentages(studentIds);
      return true;
    } else {
      // Live Firestore implementation
      const batch = firebaseFirestoreModule.writeBatch ? firebaseFirestoreModule.writeBatch(dbInstance) : null;
      
      // Standard writes if batch is not direct on standard SDK imports
      for (const rec of records) {
        // Query to check duplicates
        const q = firebaseFirestoreModule.query(
          firebaseFirestoreModule.collection(dbInstance, "attendance"),
          firebaseFirestoreModule.where("date", "==", date),
          firebaseFirestoreModule.where("studentId", "==", rec.studentId)
        );
        const qSnap = await firebaseFirestoreModule.getDocs(q);
        qSnap.forEach(async (d) => {
          await firebaseFirestoreModule.deleteDoc(d.ref);
        });
        await firebaseFirestoreModule.addDoc(
          firebaseFirestoreModule.collection(dbInstance, "attendance"),
          {
            studentId: rec.studentId,
            teacherId: teacher.uid,
            date,
            status: rec.status
          }
        );
      }
      
      await this.recalculateAttendancePercentages(records.map(r => r.studentId));
      return true;
    }
  },
  async getAttendanceForDate(date) {
    await initPromise;
    const teacher = await this.getCurrentTeacher();
    if (!teacher) throw new Error("Unauthorized.");
    if (window.isMockMode) {
      const att = MOCK_DB.get("mock_attendance");
      return att.filter(a => a.teacherId === teacher.uid && a.date === date);
    } else {
      const q = firebaseFirestoreModule.query(
        firebaseFirestoreModule.collection(dbInstance, "attendance"),
        firebaseFirestoreModule.where("teacherId", "==", teacher.uid),
        firebaseFirestoreModule.where("date", "==", date)
      );
      const querySnapshot = await firebaseFirestoreModule.getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }
  },
  async getAttendanceHistory(studentId = null) {
    await initPromise;
    const teacher = await this.getCurrentTeacher();
    if (!teacher) throw new Error("Unauthorized.");
    if (window.isMockMode) {
      const att = MOCK_DB.get("mock_attendance");
      const filtered = att.filter(a => a.teacherId === teacher.uid);
      return studentId ? filtered.filter(a => a.studentId === studentId) : filtered;
    } else {
      let q = firebaseFirestoreModule.query(
        firebaseFirestoreModule.collection(dbInstance, "attendance"),
        firebaseFirestoreModule.where("teacherId", "==", teacher.uid)
      );
      if (studentId) {
        q = firebaseFirestoreModule.query(q, firebaseFirestoreModule.where("studentId", "==", studentId));
      }
      const querySnapshot = await firebaseFirestoreModule.getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }
  },
  async recalculateAttendancePercentages(studentIds) {
    for (const studentId of studentIds) {
      const history = await this.getAttendanceHistory(studentId);
      if (history.length === 0) continue;
      
      const total = history.length;
      const attended = history.filter(a => a.status === "Present" || a.status === "Late").length;
      const percentage = Math.round((attended / total) * 100);
      await this.updateStudent(studentId, { attendancePercentage: percentage });
    }
  },
  // --- FEE SERVICES ---
  async addFeePayment(paymentData) {
    await initPromise;
    const teacher = await this.getCurrentTeacher();
    if (!teacher) throw new Error("Unauthorized.");
    const newPayment = {
      ...paymentData,
      id: window.isMockMode ? "fee-" + Math.random().toString(36).substr(2, 9) : null,
      teacherId: teacher.uid
    };
    if (window.isMockMode) {
      const fees = MOCK_DB.get("mock_fees");
      fees.push(newPayment);
      MOCK_DB.set("mock_fees", fees);
      // Find the last paid month in the covered list
      if (paymentData.monthsCovered && paymentData.monthsCovered.length > 0) {
        const sortedMonths = [...paymentData.monthsCovered].sort();
        const maxCoveredMonth = sortedMonths[sortedMonths.length - 1];
        
        // Retrieve student and update if maxCoveredMonth is more recent than lastFeePaidMonth
        const students = MOCK_DB.get("mock_students");
        const idx = students.findIndex(s => s.id === paymentData.studentId);
        if (idx !== -1) {
          const currentLastPaid = students[idx].lastFeePaidMonth || "1970-01";
          if (maxCoveredMonth > currentLastPaid) {
            students[idx].lastFeePaidMonth = maxCoveredMonth;
            MOCK_DB.set("mock_students", students);
          }
        }
      }
      return newPayment;
    } else {
      delete newPayment.id;
      const docRef = await firebaseFirestoreModule.addDoc(
        firebaseFirestoreModule.collection(dbInstance, "fees"),
        newPayment
      );
      newPayment.id = docRef.id;
      if (paymentData.monthsCovered && paymentData.monthsCovered.length > 0) {
        const sortedMonths = [...paymentData.monthsCovered].sort();
        const maxCoveredMonth = sortedMonths[sortedMonths.length - 1];
        
        const docRefStud = firebaseFirestoreModule.doc(dbInstance, "students", paymentData.studentId);
        const docSnap = await firebaseFirestoreModule.getDoc(docRefStud);
        if (docSnap.exists()) {
          const currentLastPaid = docSnap.data().lastFeePaidMonth || "1970-01";
          if (maxCoveredMonth > currentLastPaid) {
            await firebaseFirestoreModule.updateDoc(docRefStud, { lastFeePaidMonth: maxCoveredMonth });
          }
        }
      }
      return newPayment;
    }
  },
  async getFeeHistory(studentId = null) {
    await initPromise;
    const teacher = await this.getCurrentTeacher();
    if (!teacher) throw new Error("Unauthorized.");
    if (window.isMockMode) {
      const fees = MOCK_DB.get("mock_fees");
      const filtered = fees.filter(f => f.teacherId === teacher.uid);
      return studentId ? filtered.filter(f => f.studentId === studentId) : filtered;
    } else {
      let q = firebaseFirestoreModule.query(
        firebaseFirestoreModule.collection(dbInstance, "fees"),
        firebaseFirestoreModule.where("teacherId", "==", teacher.uid)
      );
      if (studentId) {
        q = firebaseFirestoreModule.query(q, firebaseFirestoreModule.where("studentId", "==", studentId));
      }
      const querySnapshot = await firebaseFirestoreModule.getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }
  },
  // --- PERFORMANCE SERVICES ---
  async addPerformanceRecord(perfData) {
    await initPromise;
    const teacher = await this.getCurrentTeacher();
    if (!teacher) throw new Error("Unauthorized.");
    const newRecord = {
      ...perfData,
      id: window.isMockMode ? "perf-" + Math.random().toString(36).substr(2, 9) : null,
      teacherId: teacher.uid
    };
    if (window.isMockMode) {
      const perfs = MOCK_DB.get("mock_performance");
      perfs.push(newRecord);
      MOCK_DB.set("mock_performance", perfs);
      // Update student overall performance badge rating
      const studentId = perfData.studentId;
      const allHistory = perfs.filter(p => p.studentId === studentId);
      if (allHistory.length > 0) {
        // Average score
        const totalPct = allHistory.reduce((acc, curr) => acc + (curr.score / curr.maxScore) * 100, 0);
        const avgPct = totalPct / allHistory.length;
        let rating = "Needs Improvement";
        if (avgPct >= 90) rating = "Excellent";
        else if (avgPct >= 75) rating = "Good";
        else if (avgPct >= 50) rating = "Average";
        const students = MOCK_DB.get("mock_students");
        const idx = students.findIndex(s => s.id === studentId);
        if (idx !== -1) {
          students[idx].performanceRating = rating;
          MOCK_DB.set("mock_students", students);
        }
      }
      return newRecord;
    } else {
      delete newRecord.id;
      const docRef = await firebaseFirestoreModule.addDoc(
        firebaseFirestoreModule.collection(dbInstance, "performance"),
        newRecord
      );
      newRecord.id = docRef.id;
      // Recalculate and update student rating in Firestore
      const q = firebaseFirestoreModule.query(
        firebaseFirestoreModule.collection(dbInstance, "performance"),
        firebaseFirestoreModule.where("studentId", "==", perfData.studentId)
      );
      const qSnap = await firebaseFirestoreModule.getDocs(q);
      let totalPct = 0;
      let count = 0;
      qSnap.forEach(d => {
        const dData = d.data();
        totalPct += (dData.score / dData.maxScore) * 100;
        count++;
      });
      if (count > 0) {
        const avgPct = totalPct / count;
        let rating = "Needs Improvement";
        if (avgPct >= 90) rating = "Excellent";
        else if (avgPct >= 75) rating = "Good";
        else if (avgPct >= 50) rating = "Average";
        const docRefStud = firebaseFirestoreModule.doc(dbInstance, "students", perfData.studentId);
        await firebaseFirestoreModule.updateDoc(docRefStud, { performanceRating: rating });
      }
      return newRecord;
    }
  },
  async getPerformanceHistory(studentId = null) {
    await initPromise;
    const teacher = await this.getCurrentTeacher();
    if (!teacher) throw new Error("Unauthorized.");
    if (window.isMockMode) {
      const perfs = MOCK_DB.get("mock_performance");
      const filtered = perfs.filter(p => p.teacherId === teacher.uid);
      return studentId ? filtered.filter(p => p.studentId === studentId) : filtered;
    } else {
      let q = firebaseFirestoreModule.query(
        firebaseFirestoreModule.collection(dbInstance, "performance"),
        firebaseFirestoreModule.where("teacherId", "==", teacher.uid)
      );
      if (studentId) {
        q = firebaseFirestoreModule.query(q, firebaseFirestoreModule.where("studentId", "==", studentId));
      }
      const querySnapshot = await firebaseFirestoreModule.getDocs(q);
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }
  }
};
