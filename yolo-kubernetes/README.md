# 🛍️ YOLO E-Commerce Application - Kubernetes on GKE

This document guides you through deploying the YOLO E-Commerce Application on Google Kubernetes Engine (GKE) using Kubernetes manifests. The application consists of a **React** frontend, **Node.js/Express** backend, and **MongoDB** database, orchestrated as microservices.

## 🚀 Overview

- **Namespace**: `yolo-app`
- **Components**:
  - **Frontend**: `mulikevs/mulikevs-yolo-client:v1.0.2` (1 replica, port 80, served by nginx)
  - **Backend**: `mulikevs/mulikevs-yolo-backend:v1.0.1` (1 replica, port 5000)
  - **Database**: `mongo:7.0.12` (StatefulSet, port 27017, persistent storage)
- **Exposure**:
  - Frontend: `http://34.28.28.204` (LoadBalancer, port 80)
  - Backend: `http://34.45.210.248/api/products` (LoadBalancer, port 80)
- **Storage**: PersistentVolumeClaim (PVC) for MongoDB

## 📦 Prerequisites

- **Tools**:
  - [kubectl](https://kubernetes.io/docs/tasks/tools/) (1.25 or later)
  - [gcloud CLI](https://cloud.google.com/sdk/docs/install)
  - [Docker](https://www.docker.com/)
  - Git
- **GCP Setup**:
  - GCP account with billing enabled
  - Project ID: `xs-tidal-cipher-3`

## 🛠️ Installation

1. **Authenticate and Configure gcloud**:
   ```bash
   gcloud auth login
   gcloud config set project xs-tidal-cipher-3
   ```

2. **Clone Repository**:
   ```bash
   git clone https://github.com/mulikevs/yolo.git
   cd yolo/yolo-kubernetes/manifests
   ```

3. **Create GKE Cluster**:
   ```bash
   gcloud container clusters create yolo-cluster \
     --zone=us-central1-a \
     --num-nodes=1 \
     --machine-type=e2-micro \
     --enable-autoscaling --min-nodes=0 --max-nodes=3
   ```

4. **Configure kubectl**:
   ```bash
   gcloud container clusters get-credentials yolo-cluster --zone=us-central1-a
   ```

5. **Directory Structure**:
   ```
   yolo-kubernetes/
   ├── manifests/
   │   ├── namespace.yaml
   │   ├── mongo-pvc.yaml
   │   ├── mongo-statefulset.yaml
   │   ├── mongo-service.yaml
   │   ├── frontend-deployment.yaml
   │   ├── frontend-service.yaml
   │   ├── backend-deployment.yaml
   │   ├── backend-service.yaml
   ├── README.md
   └── explanation.md
   ```

## 🚀 Deployment

1. **Apply Namespace**:
   ```bash
   kubectl apply -f namespace.yaml
   ```

2. **Apply Remaining Manifests**:
   ```bash
   kubectl apply -f . --recursive
   ```

3. **Verify Pods**:
   ```bash
   kubectl get pods -n yolo-app
   ```
   Expected: `yolo-client-*`, `yolo-backend-*`, `mongo-0` in `Running` state with `1/1 READY`.

4. **Verify Services**:
   ```bash
   kubectl get svc -n yolo-app
   ```
   Expected:
   - Frontend: `yolo-client` with external IP `34.28.28.204`
   - Backend: `yolo-backend` with external IP `34.45.210.248`

5. **Access Application**:
   - Frontend: `http://34.28.28.204`
   - Backend: `http://34.45.210.248/api/products`

6. **Configure Firewall (if needed)**:
   ```bash
   gcloud compute firewall-rules create allow-yolo-app \
     --allow tcp:80,tcp:5000 \
     --target-tags=gke-yolo-cluster \
     --source-ranges=0.0.0.0/0 \
     --network=default
   ```

## 🛑 Cleanup

1. **Delete Resources**:
   ```bash
   kubectl delete -f .
   ```

2. **Delete GKE Cluster**:
   ```bash
   gcloud container clusters delete yolo-cluster --zone=us-central1-a --quiet
   ```

## 🧼 Troubleshooting

- **Frontend Not Accessible**:
  - Test: `curl -v http://34.28.28.204`.
  - Check nginx logs: `kubectl logs -l app=yolo-client -n yolo-app`.
  - Verify firewall: `gcloud compute firewall-rules list --filter="network:default"`.

- **Backend Empty Response**:
  - Check backend logs: `kubectl logs -l app=yolo-backend -n yolo-app`.
  - Test API: `curl http://34.45.210.248/api/products`.
  - Verify MongoDB data: `kubectl exec -it mongo-0 -n yolo-app -- mongo --eval "db.products.find()"`.
  - Test frontend-to-backend: `kubectl exec -it -n yolo-app <yolo-client-pod> -- curl -v http://localhost/api/products`.

- **Namespace Not Found**:
  - Ensure namespace is applied: `kubectl apply -f namespace.yaml`.
  - Verify: `kubectl get namespaces`.