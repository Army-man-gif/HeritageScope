# HeritageScope
write intro to project here

## Instructions on how to download and run the project:
* **Note:** On Windows, if the path seperator causes issues, replace **`/`** with **`\`** in the file path

### 1. Database Setup
- Open your PostgreSQL terminal (psql) or pgAdmin
- Create a new database named : heritagescope:

  "psql -U **YOUR_POSTGRES_USERNAME** -c "CREATE DATABASE heritagescope;"

- Import the provided data dump : heritagescope_dump.sql:

  "psql -U **YOUR_POSTGRES_USERNAME** -d heritagescope -f Database/heritagescope_dump.sql"

### 2. Backend Configuration (Spring Boot)
- Navigate to 'Backend/heritagescope/src/main/resources/'
- Open 'application.properties' and update with your local credentials:

  properties:

  spring.datasource.url=jdbc:postgresql://localhost:5432/heritagescope
  spring.datasource.username=**YOUR_POSTGRES_USERNAME**
  spring.datasource.password=**YOUR_POSTGRES_PASSWORD**

### 3. Run the backend
- Use this command 
  "cd Backend/heritagescope
  ./mvnw clean spring-boot:run" 
  for bash terminal/macos/linux runs

- Use this command 
  "cd Backend/heritagescope
  mvnw.cmd spring-boot:run"
  for windows/command prompt runs

## Instructions before making any changes to the code:
### 1. If you don't have node.js installed
- Go to this link: https://nodejs.org/en/download
- Scroll down to where it says : "Or get a prebuilt Node.js® for Windows
  running an x64 architecture
- Pick the "Windows Installer (.msi) option
- During installation it'll give the option "Add to PATH" select that. 
- For rest select defaults
- Open a terminal run:
- node -v
- You should see v20.5.1 or some later version
- npm -v
- You should see 9.8.0 or some later version
### 2. If you have just installed node.js or already had it installed
- cd into project
- Run npm install
- Wait for it to finish running
- Run npm track
- Expect this output:
> map@1.0.0 track
> node buildandTrack.js

Starting esbuild watcher...
Initial build complete! Watching for changes...
- Now just minimise the terminal and continue. Should all work
- To cancel the tracker run "npm run cancel"
- Killing the terminal also cancels the tracker

## Libraries or requirements required to run it:
- Java 17 or above
- PostgreSQL 16
- Python 3 (for serving frontend locally)
- Node.js (only needed if modifying JS files, for esbuild bundling)
- Leaflet.js 1.9.4 (loaded via CDN)
- Leaflet.markercluster 1.4.1 (loaded via CDN)
- Spring Boot 3.5.11
- Spring Data JPA ＋ Hibernate
 
##  Prototype achievements and what is left for future development:
### Feature List

| ID | Description | Develop | Progress | Owners |
|-----|-------------|--------|----------|--------|
| F1 | Highlighting Heritage and cultural sites on a map. | Develop (Core functionality) | | Yi & Karlie
| F2 | Readable text in a large easy to see font | Develop (Core functionality) | | Yi |
| F3 | Colour blind modes | Part-develop (Enhanced functionality) | | Arsam |
| F4 | Interactive map-based visualisation | Develop (Core functionality) | | Armaan |
| F5 | Visual environmental simulation tool with additional text description | Develop (Core functionality) | | Jocelyn |
| F6 | High contrast UI. | Develop (Core functionality) | | Karlie |
| F7 | Magnification capability. | Develop (Core functionality) | | Karlie |
| F8 | Keyboard accessibility. | Develop (Core functionality) | | Armaan |
| F9 | Area filtering tool. | Part-develop (Enhanced functionality) | | Issac |
| F10 | Offline functionalities. | Part-develop (Enhanced functionality) | | Issac |
| F11 | Text to Speech tool. | Develop (Core functionality) | | Jocelyn |
| F12 | Path routing. | Part-develop (Enhanced functionality) | | Esther |
| F13 | User input on accessibility of areas. | Part-develop (Enhanced functionality) | | Arsam |
| F14 | Reward system for user input | Part-develop (Enhanced functionality) | | Arsam |
| F15 | Additional resources for areas. | Excluded from first prototype (Future development) | |May not be done, left to last. |
| F16 | Interactive snapshot of visualisation map / simulation dynamic to user’s filter and selected choices. | Part-develop (Enhanced functionality) | | May not be done, left to last. |

### Additions to our original feature list:


## Unit Testing:
Our unit testing is found in this document: 
https://docs.google.com/document/d/1wKu51U5LSkbITz1umVbN2rmAPybO5xwgnA4Y-RrfAWs/edit?usp=sharing

## Integration Testing
Our integration testing is found in this document: 
https://docs.google.com/document/d/1BPE3THLFpzZSz0-TtWhf6JdT3l1JGLzTHSeeqK8qH88/edit?usp=sharing

## Testing scripts:
Testing scripts are found in the tests folder.
