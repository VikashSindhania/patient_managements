// Google API configuration
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

class GoogleService {
  constructor() {
    this.sheetId = null;
    this.isInitialized = false;
    this.isLoading = false;
    this.initPromise = null;
    this.tokenClient = null;
  }

  async waitForGAPI() {
    //  alert("Waiting for GAPI to load...");
    return new Promise((resolve) => {
      if (window.gapi) {
        // alert("GAPI already loaded");
        resolve(window.gapi);
        return;
      }
      const checkGAPI = () => {
        if (window.gapi) {
          alert("GAPI loaded successfully");
          resolve(window.gapi);
        } else {
          setTimeout(checkGAPI, 100);
        }
      };
      checkGAPI();
    });
  }

  async waitForGIS() {
    // alert("Waiting for Google Identity Services to load...");
    return new Promise((resolve) => {
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.oauth2
      ) {
        // alert("Google Identity Services already loaded");
        resolve(window.google);
        return;
      }
      const checkGIS = () => {
        if (
          window.google &&
          window.google.accounts &&
          window.google.accounts.oauth2
        ) {
          alert("Google Identity Services loaded successfully");
          resolve(window.google);
        } else {
          setTimeout(checkGIS, 100);
        }
      };
      checkGIS();
    });
  }

  async initializeGoogleAPI() {
    // alert("Starting Google API initialization...");

    // Return existing promise if initialization is in progress
    if (this.initPromise) {
      // alert("Initialization already in progress");
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized) {
      //alert("Already initialized");
      return Promise.resolve();
    }

    this.initPromise = (async () => {
      try {
        this.isLoading = true;
        //alert("Loading state set to true");

        // Wait for both GAPI and GIS to be loaded
        //alert("Waiting for both GAPI and GIS to load...");
        const [gapi, google] = await Promise.all([
          this.waitForGAPI(),
          this.waitForGIS(),
        ]);
        // alert("Both GAPI and GIS loaded successfully");

        // Load the required Google API libraries
        // alert("Loading Google API client...");
        try {
          await new Promise((resolve, reject) => {
            window.gapi.load("client", {
              callback: () => {
                // alert("Google API client loaded successfully");
                resolve();
              },
              onerror: (error) => {
                // alert("Error loading Google API client: " + error);
                reject(error);
              },
              timeout: 5000,
              ontimeout: () => {
                //alert("Timeout loading Google API client");
                reject(new Error("Timeout loading Google API client"));
              },
            });
          });

          // Initialize the Google API client
          //alert("Initializing Google API client with credentials...");
          try {
            // Check if gapi.client exists
            if (!window.gapi.client) {
              throw new Error(
                "gapi.client is not available. Check if Google API script loaded correctly."
              );
            }

            // Log the current state of gapi
            // alert(
            //   "gapi state: " +
            //     JSON.stringify({
            //       client: !!window.gapi.client,
            //       load: !!window.gapi.load,
            //     })
            // );

            // alert(
            //   "API Key: " +
            //     (process.env.REACT_APP_GOOGLE_API_KEY ? "Present" : "Missing")
            // );
            // alert(
            //   "Client ID: " +
            //     (process.env.REACT_APP_GOOGLE_CLIENT_ID ? "Present" : "Missing")
            // );

            if (!process.env.REACT_APP_GOOGLE_API_KEY) {
              throw new Error(
                "Google API Key is missing. Please check your .env file."
              );
            }

            if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
              throw new Error(
                "Google Client ID is missing. Please check your .env file."
              );
            }

            // Initialize the Google API client with error handling
            try {
              await window.gapi.client.init({
                apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
                discoveryDocs: [
                  "https://sheets.googleapis.com/$discovery/rest?version=v4",
                  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                ],
              });
            } catch (initError) {
              console.error("Detailed initialization error:", initError);
              if (initError.status === 403) {
                throw new Error(
                  "API key does not have permission to access Google Sheets and Drive APIs. Please enable these APIs in the Google Cloud Console."
                );
              } else if (initError.status === 400) {
                throw new Error(
                  "Invalid API key. Please check your API key in the .env file."
                );
              } else {
                throw new Error(
                  `Failed to initialize Google API: ${initError.message}`
                );
              }
            }

            // Initialize the token client
            this.tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              scope: SCOPES.join(" "),
              prompt: "consent", // Force consent prompt to ensure proper authorization
              callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                  //alert("Token received successfully");
                  window.gapi.client.setToken(tokenResponse);
                } else if (tokenResponse.error === "access_denied") {
                  alert(
                    "Access was denied. Please make sure you're using a test account that's been added to the OAuth consent screen."
                  );
                } else {
                  alert(
                    "No token received in response: " +
                      (tokenResponse.error || "Unknown error")
                  );
                }
              },
            });

            // alert("Google API client initialized successfully");
          } catch (initError) {
            const errorMessage =
              initError.message || "Unknown error during gapi.client.init()";
            // alert("Error during gapi.client.init(): " + errorMessage);
            console.error("Detailed init error:", initError);
            throw new Error(`Failed to initialize Google API: ${errorMessage}`);
          }
        } catch (loadError) {
          // alert("Error loading Google API: " + loadError.message);
          console.error("Error loading Google API:", loadError);
          throw loadError;
        }

        this.isInitialized = true;
        //alert("Google API initialization completed successfully");
      } catch (error) {
        //alert("Error during initialization: " + error.message);
        console.error("Error initializing Google API:", error);
        this.initPromise = null;
        throw error;
      } finally {
        this.isLoading = false;
        //alert("Loading state set to false");
      }
    })();

    return this.initPromise;
  }

  async signIn() {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI();
    }

    try {
      return new Promise((resolve, reject) => {
        this.tokenClient.callback = async (response) => {
          if (response.error) {
            reject(response);
          }
          resolve(response);
        };
        this.tokenClient.requestAccessToken();
      });
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }

  async createSpreadsheet(title) {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI();
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.create({
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: "Patients",
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        ],
      });

      this.sheetId = response.result.spreadsheetId;

      // Set up the header row
      await this.updateValues("Patients!A1:O1", [
        [
          "Patient ID",
          "Patient Name",
          "Age",
          "Gender",
          "Phone",
          "Location",
          "Address",
          "Prescription",
          "Dose",
          "Visit Date",
          "Next Visit",
          "Physician Name",
          "Physician ID",
          "Physician Phone",
          "Bill",
        ],
      ]);

      // After creating the spreadsheet, refresh the list
      await this.listSpreadsheets();

      return response.result;
    } catch (error) {
      console.error("Error creating spreadsheet:", error);
      throw new Error(
        "Failed to create spreadsheet: " + (error.message || "Unknown error")
      );
    }
  }

  async getSpreadsheetData(range) {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI();
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range,
      });

      return response.result.values;
    } catch (error) {
      console.error("Error getting spreadsheet data:", error);
      throw error;
    }
  }

  async updateValues(range, values) {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI();
    }

    try {
      const response =
        await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: this.sheetId,
          range,
          valueInputOption: "USER_ENTERED",
          resource: {
            values,
          },
        });

      return response.result;
    } catch (error) {
      console.error("Error updating values:", error);
      throw error;
    }
  }

  async appendValues(range, values) {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI();
    }

    try {
      const response =
        await window.gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: this.sheetId,
          range,
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          resource: {
            values,
          },
        });

      return response.result;
    } catch (error) {
      console.error("Error appending values:", error);
      throw error;
    }
  }

  async listSpreadsheets() {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI();
    }

    try {
      console.log("Fetching spreadsheets...");
      const response = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: "files(id, name)",
        spaces: "drive",
        pageSize: 50,
        orderBy: "modifiedTime desc",
      });

      console.log("Spreadsheets response:", response);

      if (!response.result || !response.result.files) {
        console.warn("No files found in response:", response);
        return [];
      }

      return response.result.files;
    } catch (error) {
      console.error("Error listing spreadsheets:", error);
      throw new Error(
        "Failed to list spreadsheets: " + (error.message || "Unknown error")
      );
    }
  }

  setSheetId(id) {
    this.sheetId = id;
    localStorage.setItem("selectedSheetId", id);
  }

  getSheetId() {
    if (!this.sheetId) {
      this.sheetId = localStorage.getItem("selectedSheetId");
    }
    return this.sheetId;
  }

  clearSheetId() {
    this.sheetId = null;
    localStorage.removeItem("selectedSheetId");
  }

  isSheetSelected() {
    return !!this.getSheetId();
  }

  async getValues(range) {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI();
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.getSheetId(),
        range: range,
      });

      return response.result;
    } catch (error) {
      console.error("Error getting values:", error);
      throw error;
    }
  }

  async updateRow(sheetName, rowIndex, values) {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI();
    }

    try {
      // Update the values in the specified row
      const range = `${sheetName}!A${rowIndex}:O${rowIndex}`;
      await this.updateValues(range, [values]);
    } catch (error) {
      console.error("Error updating row:", error);
      throw error;
    }
  }

  async deleteRow(sheetName, rowIndex) {
    if (!this.isInitialized) {
      await this.initializeGoogleAPI();
    }

    try {
      // First, get the spreadsheet metadata to find the correct sheet ID
      const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: this.getSheetId(),
      });

      const sheet = spreadsheet.result.sheets.find(
        (s) => s.properties.title === sheetName
      );
      if (!sheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
      }

      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.getSheetId(),
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheet.properties.sheetId,
                  dimension: "ROWS",
                  startIndex: rowIndex - 1,
                  endIndex: rowIndex,
                },
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error deleting row:", error);
      throw new Error(`Failed to delete row: ${error.message}`);
    }
  }
}

// Create and export a single instance
export const googleService = new GoogleService();
