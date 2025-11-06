<!-- .github/copilot-instructions.md -->
# Copilot instructions for app-daf (AppDAF)

This file contains focused, actionable information to help AI coding agents be productive immediately in this repo.

Keep guidance short and concrete. Reference the files and patterns shown below when generating edits or new code.

1) Big picture / architecture
- Framework: NestJS (source in `src/`, `nest-cli.json` has `sourceRoot: "src"`). The app is organized as Nest modules (e.g. `AppModule`, `CitoyenModule`).
- Purpose: a microservice that reads/writes citizen records and request logs in Google Firestore via the Firebase Admin SDK.
- Key runtime pieces:
  - Entrypoint used by the project sources: `src/main.ts` — sets global `ValidationPipe`, `AllExceptionsFilter` and `LoggingInterceptor`, and enables CORS.
  - Firebase integration: `src/config/firebase.config.ts` (provides `FirebaseService` with getFirestore(), getAuth(), getStorage()).
  - Primary domain module: `src/citoyen/*` — controller, service, DTOs, entities.

2) Important files to read before editing
- `src/main.ts` — global pipes, filters and interceptors are registered here.
- `src/config/firebase.config.ts` — Firebase Admin initialization and required env vars.
- `src/citoyen/citoyen.controller.ts` — HTTP routes and basic validations (API prefix: `/api`).
- `src/citoyen/citoyen.service.ts` — Firestore queries, collection names (`citoyens`, `request_logs`), logging and pagination logic.
- DTOs and entities: `src/citoyen/dto/*.ts`, `src/citoyen/entities/*.ts` (use these shapes for request/response consistency).

3) API contracts & conventions (observable in code)
- All JSON responses follow a wrapper: { success: boolean, data?, error?, message? }.
- Routes use the `/api` prefix (see `CitoyenController`). Examples:
  - GET `/api/health` → health object (success/status/timestamp).
  - GET `/api/citoyens/:nci` → returns `CitoyenResponseDto` or an error object.
  - GET `/api/citoyens` → search with `nom`, `actif`, `page`, `limit`.
  - GET `/api/logs` and `/api/logs/compte/:comptePrincipal` → paginated logs.
- Validation expectations: NCI is exactly 13 digits. The project uses `class-validator` DTOs (e.g. `GetCitoyenDto`) and also performs a manual regex check in the controller — preserve both patterns when editing.

4) Firebase / env specifics (do not change without testing)
- Environment variables used by `FirebaseService` (see `src/config/firebase.config.ts`):
  - FIREBASE_PRIVATE_KEY (stored in env; code replaces `\\n` with actual newlines)
  - FIREBASE_PROJECT_ID
  - FIREBASE_CLIENT_EMAIL
  - FIREBASE_DATABASE_URL
  - PORT, NODE_ENV
- When creating or changing initialization code, keep the `privateKey?.replace(/\\n/g, '\n')` behavior — many deployments store the key with escaped newlines.

5) Firestore usage patterns & traps (from `citoyen.service.ts`)
- Collections: `citoyens` and `request_logs`.
- Query construction uses `where()`, `orderBy()`, `offset()` and `limit()`. Firestore requires appropriate composite indexes for some `where+orderBy` patterns — adding queries may need index creation.
- Total counts are computed by fetching the whole collection (`.get()` then `.size`) — this is simple but can be slow for large datasets. If you change pagination, preserve current behavior or explicitly opt-in to an optimized approach.
- When writing logs, `dateRequete` is stored as ISO string in the Firestore document (service calls `new Date().toISOString()` before adding).

6) Global error & logging behavior
- Global exception handling is implemented in `src/common/filters/http-exception.filter.ts`. Any thrown `HttpException` is normalized to the project response shape.
- Request logging is handled by `src/common/interceptors/logging.interceptor.ts` which logs via Nest's `Logger` with a `HTTP` context and includes response time.

7) Project-specific quirks / housekeeping
- package.json appears out-of-sync with the Nest/TypeScript project: it contains `"start": "nodemon src/app.js"` and dependencies for Express. Don't assume `npm start` runs the Nest app. Check CI or ask maintainers before changing scripts.
- `nest-cli.json` exists and `sourceRoot` is `src` — project was scaffolded with Nest. Prefer `nest start` / `ts-node` or building via `tsc` in developer workflows (confirm with maintainers if you need to add scripts).
- The codebase uses French for comments, error codes and messages. Keep new messages consistent (French) unless told otherwise.

8) How to add a new endpoint / feature (concrete pattern)
- Add a controller method under `src/citoyen/citoyen.controller.ts` or create a new module if the feature is separate.
- Implement business logic in the corresponding service (e.g., `CitoyenService`) and use `FirebaseService.getFirestore()` for DB calls.
- Add DTOs to `src/citoyen/dto/` and entity shapes to `src/citoyen/entities/` when appropriate.
- Register providers in the module (see `src/citoyen/citoyen.module.ts`) and export services if they are used by other modules.

9) Safe edit checklist (before opening a PR)
- Run the app locally and exercise `/api/health` to confirm bootstrap and Firebase init (requires env vars).
- Verify that global pipes/filters/interceptors in `src/main.ts` still apply to your new endpoints.
- Preserve the response envelope shape (success/data/error/message) for consistency.
- If adding Firestore queries, consider index requirements and the cost of `.get()` for total counts.

10) When uncertain, inspect these files first
- `src/main.ts`, `src/config/firebase.config.ts`, `src/citoyen/citoyen.service.ts`, `src/citoyen/citoyen.controller.ts`, `src/common/filters/http-exception.filter.ts`.

----
If anything here is unclear or you want a different level of detail (examples, snippet templates for controllers/services, or suggested npm scripts), tell me which section to expand and I'll iterate.
