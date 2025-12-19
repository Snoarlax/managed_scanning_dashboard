# Managed Scanning Dashboard

This repository contains code for the managed scanning dashboard, an all in one view that collates information from different scanning sources to be used by managed scanning providers.

## Principles
This tool was designed with some principles in mind to make sure it is fit for purpose.

### Read only
  - This is a single pane of view dashboard designed specifically to streamline the day to day for managed scanning vendors. Adding write mechanisms adds unecessary complexity to your workflows, its better in the long run if you configure your scans using the vendor that provides them.

### Minimal
  - Only grab the data you need for your work, only show it to you

### Familiar
  - It doesn't invent new workflows with a learning curve, it uses the ones that you already use but better.

### Responsive
  - Dashboards can be slow, I've used platforms where i've found myself opening three or four tabs just so i can pipeline actions. You shouldn't need to do that with this platform.

### Blame-able
  - If something isn't showing, it should be easy to figure out what went wrong. Is it the platform, or is it the vendor? Where should the user look next. The biggest problem of adding extra tools is adding additional points of failure, we don't want to do that.

### Lightweight
  - This is a culmination of various other principles, but the main point here should be how its lightweight on the users Attack surface. Added features should have a careful consideration on how it affects the attack surface of the application, I expect most of the attack surface to be concentrated within the integrations with scan vendors and authentication (which ideally will be largely managed by something else anyways). The main risk should be a confused deputy style problem and this should be sufficiently catalogued and mitigated where possible.


### Architecture

  - FastAPI Backend (Python 3.10+)
  - Qualys SDK (`qualysdk`) for API integration
  - `uv` for Python package management
  - React (Vite) frontend with Typescript and Tailwind CSS

## Getting Started

### Backend Setup
## Using Docker (RECOMMENDED)
1. export the following environment variables: QUALYS_USERNAME, QUALYS_PASSWORD, QUALYS_REGION
2. Go to the ./backend_src/ directory and run docker-compose: docker-compose up --build
(I have to run it with sudo on my system, sudo -E docker-compose up --build)


### Frontend Setup
1. Navigate to the `frontend_src` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. (Optional) Run the backend from the frontend directory: `npm run server`
