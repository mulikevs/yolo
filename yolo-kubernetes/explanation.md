# YOLO E-Commerce Application - Kubernetes Setup Explanation

## Overview
The YOLO E-Commerce Application is deployed on Google Kubernetes Engine (GKE) using Kubernetes manifests to orchestrate a **React** frontend, **Node.js/Express** backend, and **MongoDB** database as microservices. This document explains the setup, configuration, and deployment process.

## Architecture
- **Namespace**: `yolo-app`
- **Components**:
  - **Frontend**:
    - Deployment: `yolo-client` (1 replica, `mulikevs/mulikevs-yolo-client:v1.0.3`)
    - Image: Uses nginx to serve static React files, proxies `/api/` to the backend
    - Port: 80
    - Service: `yolo-client` (LoadBalancer, external IP: `34.28.28.204`, port 80)
  - **Backend**:
    - Deployment: `yolo-backend` (1 replica, `mulikevs/mulikevs-yolo-backend:v1.0.1`)
    - Image: Node.js/Express server, connects to MongoDB via `MONGO_URI=mongodb://mongo:27017/yolomy`
    - Port: 5000
    - Service: `yolo-backend` (LoadBalancer, external IP: `34.45.210.248`, port 80)
  - **Database**:
    - StatefulSet: `mongo-0` (1 replica, `mongo:7.0.12`)
    - Storage: PersistentVolumeClaim (`mongo-pvc`, 10Gi)
    - Service: `mongo` (ClusterIP: None, port 27017)
- **Networking**:
  - GKE `LoadBalancer` services expose the frontend and backend externally.
  - Nginx in the frontend proxies `/api/` requests to `yolo-backend:5000`.
  - Kubernetes DNS resolves `mongo` and `yolo-backend` within the `yolo-app` namespace.

## Deployment Process
1. **GKE Cluster**:
   - Created with 1 node (`e2-micro`), autoscaling (0-3 nodes) in `us-central1-a`.
   - Configured using `gcloud container clusters create`.
2. **Manifests**:
   - `namespace.yaml`: Creates the `yolo-app` namespace.
   - `mongo-pvc.yaml`: Allocates 10Gi storage for MongoDB.
   - `mongo-statefulset.yaml`: Deploys MongoDB with a StatefulSet for stable identity.
   - `mongo-service.yaml`: Headless service for MongoDB DNS resolution.
   - `frontend-deployment.yaml`: Deploys the frontend with nginx.
   - `frontend-service.yaml`: Exposes the frontend via LoadBalancer.
   - `backend-deployment.yaml`: Deploys the backend with `MONGO_URI`.
   - `backend-service.yaml`: Exposes the backend via LoadBalancer.
3. **Firewall**:
   - A firewall rule allows TCP ports 80 and 5000 to GKE nodes for external access.
4. **Access**:
   - Frontend: `http://34.28.28.204`
   - Backend: `http://34.45.210.248/api/products`

## Configuration Details
- **Frontend**:
  - The `Dockerfile` builds the React app (`npm run build`) and uses `nginx:1.23-alpine` to serve static files.
  - `nginx.conf` proxies `/api/` to `yolo-backend:5000`, eliminating the need for `REACT_APP_API_URL`.
  - A readiness probe ensures the container is ready (`http://:80/`).
- **Backend**:
  - Connects to MongoDB using `MONGO_URI=mongodb://mongo:27017/yolomy`.
  - A readiness probe (if added) checks `/api/products/health`.
- **MongoDB**:
  - Uses a StatefulSet for stable pod identity and persistent storage.
  - The headless service (`mongo`) enables DNS resolution (`mongo.yolo-app.svc.cluster.local`).

## Troubleshooting
- **Frontend Issues**:
  - If `http://34.28.28.204` fails, check nginx logs and firewall rules.
  - Verify service endpoints and pod health.
- **Backend Issues**:
  - An empty `/api/products` response may indicate missing MongoDB data; seed data if needed.
  - Check backend logs for connection or route errors.
- **Networking**:
  - Ensure firewall rules allow traffic to the external IPs.
  - Test connectivity within pods using `curl`.

This setup ensures a scalable, production-ready deployment of the YOLO application on GKE with external access to both frontend and backend services.