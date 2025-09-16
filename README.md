# CRUD Client — Full Stack (Angular 17 + Spring Boot 3, Java 21)

%%{init: {"theme":"base","themeVariables":{
  "primaryColor":"#1e293b",
  "primaryTextColor":"#ffffff",
  "tertiaryColor":"#f1f5f9",
  "lineColor":"#475569",
  "clusterBkg":"#0ea5e9",
  "clusterBorder":"#0284c7"
}}}%%
graph TB
  %% LAYOUT
  classDef layer fill:#ffffff,stroke:#cbd5e1,stroke-width:1px,color:#0f172a;
  classDef node  fill:#f8fafc,stroke:#94a3b8,stroke-width:1px,color:#0f172a;
  classDef api   fill:#ecfeff,stroke:#06b6d4,stroke-width:1px,color:#083344;
  classDef db    fill:#fef9c3,stroke:#eab308,stroke-width:1px,color:#422006;
  classDef pkg   fill:#eef2ff,stroke:#6366f1,stroke-width:1px,color:#1e1b4b;

  subgraph FE["Frontend — Angular 17 (HTML • CSS • TypeScript)"]
    class FE layer
    FE_APP["Angular App\n(Standalone Components • Signals • New Control Flow)"]:::node
    FE_TABLE["Clients Table View\n(search • sort • export CSV/XLSX)"]:::node
    FE_DETAIL["Client Detail Popup\n(edit • delete • create)"]:::node
    FE_COOKIE["Cookie: RABO_CLIENTS\n(total clients • 1-day expiry)"]:::node

    subgraph FE_PKGS["Frontend Packages"]
      class FE_PKGS layer
      PKG_MAT["Angular Material"]:::pkg
      PKG_WC["world-countries"]:::pkg
      PKG_XLSX["xlsx (Excel parsing)"]:::pkg
    end

    FE_APP --> FE_TABLE
    FE_APP --> FE_DETAIL
    FE_APP --> FE_COOKIE
    FE_APP -. uses .-> PKG_MAT
    FE_APP -. country lists .-> PKG_WC
    FE_APP -. import/export .-> PKG_XLSX
  end

  subgraph BE["Backend — Java 21 • Spring Boot 3 • Maven 3.9.x"]
    class BE layer
    API["REST API\n/clients, /clients/bulk, /clients/events (SSE)"]:::api
    SVC["Service Layer\n(validation • email normalization)"]:::node
    JPA["Data Access (Spring Data JPA)"]:::node
    SSE["ClientEventService (SSE)\nCREATED • UPDATED • DELETED"]:::node
    API --> SVC --> JPA
    SVC --> SSE
  end

  subgraph DATA["Database"]
    class DATA layer
    PG[("PostgreSQL\nclients(id, fullName, displayName, email UNIQUE, details, active, location, country)")]:::db
  end

  %% INTEGRATION FLOWS
  FE_APP -- "HTTP/JSON (GET/POST/PUT/DELETE)" --> API
  API -- "JPA" --> PG
  SSE -- "SSE stream" --> FE_APP
  FE_COOKIE -. set from FE after GET count .-> FE_APP


A small end-to-end CRUD app for managing clients, with:
- **Frontend:** Angular 17 (standalone components), Angular Material, XLSX Excel parsing
- **Backend:** Spring Boot 3 (Java 21), REST + SSE events, JPA
- **Build/Test:** Maven 3.9.x, JUnit 5, JaCoCo

## Table of Contents
- Overview
- Features
- Requirements & Status ✅
- Architecture
- Getting Started
- API Overview
- Bulk Import Payloads
- Events (SSE)
- Testing & Coverage
- Troubleshooting

---

## Overview

This repository provides a minimal client management system:
- Create, list, update, and delete clients
- Bulk Excel import on the frontend (maps to API bulk create)
- Server-Sent Events (SSE) stream for client change notifications

Primary dev defaults:
- **Frontend dev server:** http://localhost:4200
- **Backend server:** http://localhost:8080
- **CORS:** Backend allows `http://localhost:4200`

---

## Features

- **Clients CRUD** (`/api/v1/clients`).
- **Bulk create** endpoint to ingest many clients at once.
- **SSE events** on create/update/delete to let UIs react live.
- **Excel upload** (XLSX) with header validation and mapping in Angular.
- **Validation** of requests and clear error messages when mis-shaped payloads arrive.
- **Tests & Coverage** with JaCoCo.

---

## Requirements & Status ✅

### Core Requirements
1. **Clients table view:** Create a single view in the Angular frontend that displays a table containing all the clients fetched from the backend. **DONE**

2. **Client detail view:** When a client entry is clicked in the table, a detailed view of the selected client’s information should be displayed in a popup. **DONE**

3. **Data modification:** Allow the user to edit and delete client data within the application. When the user submits changes, the updated data should be persisted. **DONE**

4. **Data addition:** Allow the user to create a new client entity. **DONE**

5. **Search functionality:** Add a search bar that allows users to search for clients. **DONE**

6. **Error handling:** Implement robust error handling to ensure meaningful responses for various scenarios. **DONE**

7. **Cookie Management:** Calculate the total number of clients in the database and store a cookie named **RABO_CLIENTS** on the same domain. This cookie represents the current total number of clients, is accessible to the Angular application, and has an expiry time of **1 day**. **DONE**

8. **Angular Signals:** Implement at least one signal to demonstrate understanding of Angular Signals. **DONE**

9. **New Angular control flow:** Use Angular’s new built-in control flow blocks. **DONE**

10. **Angular stand-alone components:** Use Angular’s stand-alone components to enhance modularity and maintainability. **DONE**

11. **Unit Testing:** Achieve unit test coverage of **80%**. **Backend: DONE; Frontend: Working on it**

12. **GitHub Repository:** Maintain a public GitHub repository where the full-stack project (frontend and backend) code is accessible for review. Include separate directories for the Angular and Spring Boot codebases. **DONE**

13. **README Documentation:** Provide a comprehensive README file in the GitHub repository, including:
    - A high-level architecture overview  
    - Project setup instructions for both frontend and backend  
    - Insights into the thought process during development  
    - Use of additional packages or libraries  
    - Potential future improvements  
    - Challenges faced and solutions implemented  
    - Example API usage and endpoints  
   **Status:** WORKING ON IT (this file)

### Optional Features
1. **Sorting Functionality:** Implement the ability to sort the client list based on client’s name or ID. Users can toggle ascending/descending. **DONE**

2. **Data export:** Allow users to export the displayed data to a CSV or Excel file. **DONE**

3. **Notification System:** Show real-time notifications when certain events occur (e.g., client data updated, a new client is added, etc.). **DONE**

4. **Data import:** Add an option for users to upload a file to import client data, parse it on the frontend, and send it to the backend. **DONE**

5. **Authentication & Authorization:**  
   - Add a login page and implement authentication (e.g., JWT)  
   - Restrict access by role (admin vs regular user)  
   **Status:** NOT IMPLEMENTED YET

6. **End-to-End (E2E) Testing:** Use a tool like Cypress to write automated tests for the entire user journey, including navigation, table interactions, and API calls. **NOT IMPLEMENTED YET**

7. **Save as draft:** Implement a feature that allows users to temporarily save a new client’s information as a draft.  
   **Status:** DIFFERENT APPROACH — using Excel file to maintain.

---

## Architecture

- **Angular 17** app using standalone components and signals:
  - `ClientUploadComponent` reads `.xlsx`, validates required headers, maps rows to the server’s request shape, and calls the bulk endpoint.
  - Uses Angular Material for UI elements and feedback.

- **Spring Boot 3** backend:
  - REST controller `ClientController` under `/api/v1/clients`
  - Service layer (`ClientService`) normalizes inputs (e.g., email lowercasing/trim)
  - JPA repository (`ClientRepository`) with unique email constraint
  - SSE event service (`ClientEventService`) broadcasting `CREATED|UPDATED|DELETED`
  - Global exception handler for consistent error JSON

---

## Getting Started

### Prerequisites
- **Java 21**
- **Maven 3.9.x**
- **Node 18+** (Angular 17 requires Node 18 or newer)
- **Angular CLI 17** (optional but recommended)

### Backend — Spring Boot
    mvn -q spring-boot:run
By default the app listens on `http://localhost:8080`.

### Frontend — Angular
    # From the Angular app folder
    npm install
    ng serve -o
Front-end builds to `http://localhost:4200`, which is allowed by backend CORS.

---

## API Overview

Base path:
- `http://localhost:8080/api/v1/clients`

Endpoints:
- `GET /api/v1/clients`
  - Returns: JSON object `{ "clients": ClientDto[] }`
- `POST /api/v1/clients`
  - Body: one `CreateClientRequest`
  - Returns: snapshot `{ "clients": ClientDto[] }`
- `POST /api/v1/clients/bulk`
  - Body: **raw JSON array** of `CreateClientRequest` (see “Bulk Import Payloads”)
  - Returns: snapshot
- `PUT /api/v1/clients`
  - Body: `UpdateClientRequest` (must contain `id`)
  - Returns: snapshot
- `DELETE /api/v1/clients`
  - Body: `{ "ids": number[] }`
  - Returns: snapshot
- `GET /api/v1/clients/events`
  - SSE stream of client change events

Common fields:
- Client: `id?`, `fullName`, `displayName`, `email`, `details?`, `active`, `location?`, `country`
- Snapshot wrapper: `{ "clients": ClientDto[] }`

---

## Bulk Import Payloads

The backend bulk endpoint expects a **raw JSON array** of `CreateClientRequest`:
    [
      {
        "fullName": "Carlos Ruiz",
        "displayName": "Carlos R.",
        "email": "carlos.ruiz@example.com",
        "details": "Bilingual account manager experienced in enterprise onboarding.",
        "active": true,
        "location": "Madrid, Spain",
        "country": "Spain"
      },
      {
        "fullName": "Anna Müller",
        "displayName": "Anna M.",
        "email": "anna.mueller@example.com",
        "details": "Data analyst skilled in SQL and dashboarding.",
        "active": true,
        "location": "Berlin, Germany",
        "country": "Germany"
      }
    ]

Avoid sending a wrapped object like `{ "data": [...] }` or `{ "clients": [...] }` unless you explicitly changed the controller to accept a wrapper DTO.

If your frontend source rows contain `id`, you can:
- Strip `id` on the frontend before calling bulk **OR**
- Annotate the backend `CreateClientRequest` with `@JsonIgnoreProperties(ignoreUnknown = true)` to ignore `id`.

---

## Events (SSE)

Subscribe to:
- `GET /api/v1/clients/events`

You’ll receive `ClientEvent` objects with:
- `type`: `CREATED`, `UPDATED`, or `DELETED`
- `clientId`
- `displayName?`
- `at` (timestamp)

---

## Testing & Coverage

Run all tests:
    mvn -q -DskipITs test

Generate JaCoCo report:
    mvn -q -DskipITs test
The HTML report is at:
- `target/site/jacoco/index.html`

Optional POM snippet to enforce 90% line coverage:
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.12</version>
      <executions>
        <execution>
          <goals>
            <goal>prepare-agent</goal>
          </goals>
        </execution>
        <execution>
          <id>report</id>
          <phase>test</phase>
          <goals>
            <goal>report</goal>
          </goals>
        </execution>
        <execution>
          <id>check</id>
          <goals>
            <goal>check</goal>
          </goals>
          <configuration>
            <rules>
              <rule>
                <element>BUNDLE</element>
                <limits>
                  <limit>
                    <counter>LINE</counter>
                    <value>COVEREDRATIO</value>
                    <minimum>0.90</minimum>
                  </limit>
                </limits>
              </rule>
            </rules>
          </configuration>
        </execution>
      </executions>
    </plugin>

---

## Troubleshooting

- **CORS errors**: ensure the backend is running and allows `http://localhost:4200`. Default WebConfig maps `/api/**` for that origin.
- **Bulk parse error**: the server expects a raw array. If you send `{ "data": [...] }`, you’ll get a JSON parse error.
- **Unique email violation**: emails must be unique; importing duplicates will fail at the DB level.
- **Coverage < 90%**: open `target/site/jacoco/index.html`, sort by “Missed Instructions,” and add tests for the red lines (often error branches).