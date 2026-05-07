import { 
  collection, 
  query, 
  getDocs, 
  getDoc,
  doc, 
  orderBy, 
  onSnapshot,
  getDocFromServer,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

// CRITICAL: Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export interface ArchiveItem {
  id: string;
  title: string;
  category: string;
  date: string;
  filesize: string;
  type: string;
  fileUrl: string;
  uploaderId: string;
  description?: string;
  tags?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  nip?: string;
  ttl?: string;
  edu?: string;
  gol?: string;
  img?: string;
  order?: number;
  subject?: string;
  email?: string;
  bio?: string;
  achievements?: string[];
}

export const getArchives = (callback: (data: ArchiveItem[]) => void) => {
  const path = 'archives';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const archives = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ArchiveItem[];
    callback(archives);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const getStaff = (callback: (data: StaffMember[]) => void) => {
  const path = 'staff';
  const q = query(collection(db, path), orderBy('order', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const staff = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StaffMember[];
    callback(staff);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export interface DownloadLog {
  id: string;
  archiveId: string;
  archiveTitle: string;
  userEmail?: string;
  userName?: string;
  timestamp: any;
}

export interface Category {
  id: string;
  name: string;
  createdAt: any;
}

export const logDownload = async (item: ArchiveItem, user: any) => {
  const path = 'downloadLogs';
  try {
    await addDoc(collection(db, path), {
      archiveId: item.id,
      archiveTitle: item.title,
      userEmail: user?.email || 'Anonymous',
      userName: user?.displayName || 'Guest',
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to log download:", error);
  }
};

export const getDownloadLogs = (callback: (data: DownloadLog[]) => void) => {
  const path = 'downloadLogs';
  const q = query(collection(db, path), orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DownloadLog[];
    callback(logs);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const getCategories = (callback: (data: Category[]) => void) => {
  const path = 'categories';
  const q = query(collection(db, path), orderBy('name', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
    callback(categories);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};
