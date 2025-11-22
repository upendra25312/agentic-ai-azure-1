import { DRIVE_FOLDER_ID } from '../constants';
import { GoogleUser, Phase } from '../types';

// Type definitions for Google API globals
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGoogleClient = (clientId: string, onInitComplete: () => void) => {
  if (!clientId) {
    console.warn("Google Client ID is missing in constants.ts");
    return;
  }

  const gapiLoaded = () => {
    window.gapi.load('client', async () => {
      await window.gapi.client.init({
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      gapiInited = true;
      if (gisInited) onInitComplete();
    });
  };

  const gisLoaded = () => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      // Request access to Drive files created by app AND user email for unique filenames
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
      callback: '', // defined at request time
    });
    gisInited = true;
    if (gapiInited) onInitComplete();
  };

  // Check if scripts are already loaded
  if (window.gapi) gapiLoaded();
  if (window.google) gisLoaded();
};

export const signInToGoogle = async (): Promise<GoogleUser> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Google Client not initialized. Please check constants.ts");

    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        reject(resp);
        return;
      }
      
      // CRITICAL: Set the token for GAPI client to enable Drive API calls
      if (window.gapi.client) {
         window.gapi.client.setToken(resp);
      }

      try {
        // Fetch user profile info to get the real email address
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${resp.access_token}`
          }
        });
        
        if (!userInfoResponse.ok) throw new Error('Failed to fetch user info');
        
        const userInfo = await userInfoResponse.json();
        
        resolve({
           name: userInfo.name || "Architect",
           email: userInfo.email,
           picture: userInfo.picture || "" 
        });
      } catch (e) {
        console.error("Error fetching user info", e);
        reject(e);
      }
    };

    // Request access token with prompt
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const signOutFromGoogle = () => {
  if (window.gapi && window.gapi.client) {
    const token = window.gapi.client.getToken();
    if (token !== null && window.google && window.google.accounts) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
    }
  }
};

// --- Local Storage Fallback ---

export const saveToLocal = (data: Phase[]) => {
  try {
    localStorage.setItem('agentic_roadmap_data', JSON.stringify(data));
  } catch (e) {
    console.error("Local Storage Save Error", e);
  }
};

export const loadFromLocal = (): Phase[] | null => {
  try {
    const data = localStorage.getItem('agentic_roadmap_data');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Local Storage Load Error", e);
    return null;
  }
};

export const exportDataAsJSON = (data: Phase[]) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `agentic_roadmap_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup to prevent memory leaks
    URL.revokeObjectURL(url);
};

// --- Drive Operations ---

const PROGRESS_FILENAME_PREFIX = 'agentic_roadmap_progress_';
const USER_TRACKER_PREFIX = 'user_tracker_';

export const recordUserLogin = async (user: GoogleUser) => {
    if (!gapiInited) return;

    try {
        const fileName = `${USER_TRACKER_PREFIX}${user.email}.json`;
        const q = `name = '${fileName}' and '${DRIVE_FOLDER_ID}' in parents and trashed = false`;
        
        const listResponse = await window.gapi.client.drive.files.list({
            q: q,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        const files = listResponse.result.files;
        const timestamp = new Date().toISOString();
        
        const trackingData = {
            ...user,
            lastLogin: timestamp,
            app: "Agentic AI Architect Roadmap"
        };

        const fileContent = JSON.stringify(trackingData, null, 2);

        if (files && files.length > 0) {
            // Update existing tracking file
            const fileId = files[0].id;
            await window.gapi.client.request({
                path: `/upload/drive/v3/files/${fileId}`,
                method: 'PATCH',
                params: { uploadType: 'media' },
                body: fileContent
            });
            console.log(`Updated tracking for ${user.email}`);
        } else {
            // Create new tracking file
            const fileMetadata = {
                name: fileName,
                mimeType: 'application/json',
                parents: [DRIVE_FOLDER_ID] 
            };

            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const contentType = 'application/json';

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(fileMetadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n\r\n' +
                fileContent +
                close_delim;

            const request = window.gapi.client.request({
                'path': '/upload/drive/v3/files',
                'method': 'POST',
                'params': {'uploadType': 'multipart'},
                'headers': {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody});
            
            await request;
            console.log(`Created tracking for ${user.email}`);
        }

    } catch (error) {
        console.error("Error recording user login:", error);
        // We don't throw here to avoid blocking the UI if tracking fails
    }
};

export const saveProgressToDrive = async (data: Phase[], userEmail: string = 'default') => {
  if (!gapiInited) throw new Error("Google API not initialized");

  try {
    // 1. Search for existing file by unique name in the shared folder
    const fileName = `${PROGRESS_FILENAME_PREFIX}${userEmail}.json`;
    
    // Note: 'trashed = false' ensures we don't update deleted files
    // We look specifically in the shared folder ID
    const q = `name = '${fileName}' and '${DRIVE_FOLDER_ID}' in parents and trashed = false`;
    
    const listResponse = await window.gapi.client.drive.files.list({
      q: q,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    const files = listResponse.result.files;
    const fileContent = JSON.stringify(data, null, 2);

    if (files && files.length > 0) {
      // Update existing file
      const fileId = files[0].id;
      await window.gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'media' },
        body: fileContent
      });
      return { status: 'updated', fileId };
    } else {
      // Create new file
      const fileMetadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: [DRIVE_FOLDER_ID] 
      };

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const contentType = 'application/json';

      const multipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(fileMetadata) +
          delimiter +
          'Content-Type: ' + contentType + '\r\n\r\n' +
          fileContent +
          close_delim;

      const request = window.gapi.client.request({
          'path': '/upload/drive/v3/files',
          'method': 'POST',
          'params': {'uploadType': 'multipart'},
          'headers': {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
          },
          'body': multipartRequestBody});
      
      await request;
      return { status: 'created' };
    }

  } catch (error) {
    console.error("Drive Save Error", error);
    throw error;
  }
};

export const loadProgressFromDrive = async (userEmail: string = 'default'): Promise<Phase[] | null> => {
  if (!gapiInited) return null;

  try {
    const fileName = `${PROGRESS_FILENAME_PREFIX}${userEmail}.json`;
    const q = `name = '${fileName}' and '${DRIVE_FOLDER_ID}' in parents and trashed = false`;
    
    const listResponse = await window.gapi.client.drive.files.list({
      q: q,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    const files = listResponse.result.files;

    if (files && files.length > 0) {
        const fileId = files[0].id;
        const response = await window.gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        return response.result as Phase[];
    }
    return null;
  } catch (error) {
    console.error("Drive Load Error", error);
    return null;
  }
};