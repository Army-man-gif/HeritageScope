# HeritageScope
HeritageScope is an interactive web app that promotes the protection of cultural and natural heritage (SDG 11.4) through mapping and environmental impact simulation. It raises awareness of at-risk sites while encouraging responsible visitor behaviour. The platform also improves accessibility with wheelchair-friendly routing, accessible facility mapping, and inclusive design features (SDG 11.2, 11.7).

## Libraries or requirements required to run it:
- Java 17 or above
- PostgreSQL 16
- Python 3 (for serving frontend locally)
- Node.js (only needed if modifying JS files, for esbuild bundling)
- Leaflet.js 1.9.4 (loaded via CDN)
- Leaflet.markercluster 1.4.1 (loaded via CDN)
- Spring Boot 3.5.11
- Spring Data JPA ＋ Hibernate

## Instructions on how to download and run the project:
* **Note:** On Windows, if the path seperator causes issues, replace **`/`** with **`\`** in the file path

### 1. Database Setup
- Open your PostgreSQL terminal (psql) or pgAdmin
- Create a new database named : heritagescope

  using : psql -U **YOUR_POSTGRES_USERNAME** -c "CREATE DATABASE heritagescope;"

- Import the provided data dump : heritagescope_dump.sql

  using : psql -U **YOUR_POSTGRES_USERNAME** -d heritagescope -f Database/heritagescope_dump.sql

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

- **Deployed backend note:** We currently have a deployed backend at `http://217.154.38.248:8080/` (backend only). The frontend is not hosted on that server, so please run the frontend locally.

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
 
##  Prototype achievements and what is left for future development:
### Feature List

| ID | Description | Develop | Progress | Owners |
|-----|-------------|--------|----------|--------|
| F1 | Highlighting Heritage and cultural sites on a map. | Develop (Core functionality) | Completed | Yi & Karlie
| F2 | Readable text in a large easy to see font | Develop (Core functionality) | Completed | Yi |
| F3 | Colour blind modes | Part-develop (Enhanced functionality) | Completed | Arsam |
| F4 | Interactive map-based visualisation | Develop (Core functionality) | Completed | Armaan |
| F5 | Visual environmental simulation tool with additional text description | Develop (Core functionality) | Completed | Jocelyn |
| F6 | High contrast UI. | Develop (Core functionality) | Completed | Karlie |
| F7 | Magnification capability. | Develop (Core functionality) | Completed | Karlie |
| F8 | Keyboard accessibility. | Develop (Core functionality) | Completed | Armaan |
| F9 | Area filtering tool. | Part-develop (Enhanced functionality) | Part-completed | Issac |
| F10 | Offline functionalities. | Part-develop (Enhanced functionality) | Not Completed | May not be done, left to last. |
| F11 | Text to Speech tool. | Develop (Core functionality) | Completed | Jocelyn |
| F12 | Path routing. | Part-develop (Enhanced functionality) | Completed | Esther |
| F13 | User input on accessibility of areas. | Part-develop (Enhanced functionality) | Completed | Arsam |
| F14 | Reward system for user input | Part-develop (Enhanced functionality) | Not completed | May not be done, left to last. |
| F15 | Additional resources for areas. | Excluded from first prototype (Future development) | Not Completed |May not be done, left to last. |
| F16 | Interactive snapshot of visualisation map / simulation dynamic to user’s filter and selected choices. | Part-develop (Enhanced functionality) | Completed | Isaac |

### Additions to our original feature list:
- Site Status Overlay (Karlie) : A risk overlay that fetches heritage site status (visitor pressure, weather condition, risk level) from a Spring Boot REST API supported by PostgreSQL, displaying red/amber/green circles on the map to show at-risk sites. Built as an extension of F-1.

## Test plan:
Our test plan is found in this document:
https://docs.google.com/document/d/1uayuSvuXrsjj2sE6vIspbjBfYhKkpXGeEHkP5162zcg/edit?usp=sharing

## Unit Testing:
Our unit testing is found in this document: 
https://docs.google.com/document/d/1wKu51U5LSkbITz1umVbN2rmAPybO5xwgnA4Y-RrfAWs/edit?usp=sharing

## Integration Testing
Our integration testing is found in this document: 
https://docs.google.com/document/d/1BPE3THLFpzZSz0-TtWhf6JdT3l1JGLzTHSeeqK8qH88/edit?usp=sharing

## Testing scripts:
Testing scripts are found in the Tests folder.
