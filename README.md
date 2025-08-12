# 🛍️ YOLO E-Commerce Application

The YOLO E-Commerce Application is a full-stack platform featuring a customer-facing storefront and an admin dashboard for managing products. Built with **React** for the frontend, **Node.js/Express** for the backend, and **MongoDB** for the database, it uses a microservices architecture. This project supports two deployment methods:
- **Local Deployment**: Uses Vagrant and Ansible to provision an Ubuntu 22.04 virtual machine with Dockerized services orchestrated by Docker Compose.
- **Kubernetes Deployment**: Deploys to Google Kubernetes Engine (GKE) using Kubernetes manifests (see [Kubernetes README](yolo-kubernetes/README.md)).

This document focuses on the local Vagrant-based setup. For GKE deployment, refer to [yolo-kubernetes/README.md](yolo-kubernetes/README.md).

## 🚀 Overview

- **Architecture**: Microservices with separate frontend, backend, and database services.
- **Local Deployment**:
  - **Frontend**: React application for storefront and admin dashboard.
  - **Backend**: Node.js/Express REST API for product management.
  - **Database**: MongoDB (Dockerized).
  - **Orchestration**: Docker Compose, provisioned via Vagrant and Ansible on Ubuntu 22.04.
- **Kubernetes Deployment**: See [yolo-kubernetes/README.md](yolo-kubernetes/README.md) for GKE setup.

| Layer      | Technology                       | Port  |
|------------|----------------------------------|-------|
| Frontend   | React (`mulikevs/mulikevs-yolo-client:v1.0.3`) | 3000  |
| Backend    | Node.js + Express (`mulikevs/mulikevs-yolo-backend:v1.0.1`) | 5000  |
| Database   | MongoDB (`mongo:7.0.12`)         | 27017 |
| DevOps     | Vagrant, Ansible, Docker Compose | -     |

## 📦 Prerequisites

To run the local deployment, ensure you have:
- [Vagrant](https://www.vagrantup.com/downloads) (2.2.19 or later)
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) (6.1 or later)
- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) (2.10 or later)
- [Git](https://git-scm.com/downloads)
- Internet access for downloading the Vagrant box and Docker images
- System requirements:
  - 4GB RAM and 2 CPU cores (minimum for VM)
  - 10GB free disk space

For Kubernetes deployment on GKE, see [yolo-kubernetes/README.md](yolo-kubernetes/README.md).

## 🛠️ Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/mulikevs/yolo.git
   cd yolo
   ```

2. **Verify Project Structure**:
   ```
   yolo/
   ├── backend/
   │   ├── Dockerfile
   │   ├── server.js
   │   ├── package.json
   │   └── ... (other backend files)
   ├── client/
   │   ├── Dockerfile
   │   ├── nginx.conf
   │   ├── package.json
   │   ├── src/
   │   └── ... (other frontend files)
   ├── yolo-kubernetes/
   │   ├── manifests/
   │   │   ├── namespace.yaml
   │   │   ├── mongo-pvc.yaml
   │   │   ├── mongo-statefulset.yaml
   │   │   ├── mongo-service.yaml
   │   │   ├── frontend-deployment.yaml
   │   │   ├── frontend-service.yaml
   │   │   ├── backend-deployment.yaml
   │   │   ├── backend-service.yaml
   │   ├── README.md
   │   └── explanation.md
   ├── Vagrantfile
   ├── ansible.cfg
   ├── playbook.yaml
   ├── vars.yml
   ├── docker-compose.yaml
   ├── hosts/
   │   └── hosts
   ├── roles/
   │   ├── common_config/
   │   │   ├── tasks/
   │   │   └── ... (Ansible tasks for system setup)
   │   ├── docker_setup/
   │   │   ├── tasks/
   │   │   └── ... (Ansible tasks for Docker)
   │   ├── app_deployment/
   │   │   ├── tasks/
   │   │   └── ... (Ansible tasks for app deployment)
   │   └── mongodb_setup/
   │       ├── tasks/
   │       └── ... (Ansible tasks for MongoDB)
   ├── explanation.md
   └── README.md
   ```

3. **Install Dependencies**:
   - Ensure Vagrant, VirtualBox, and Ansible are installed.
   - Ansible is executed within the VM by Vagrant, so no host-side Ansible setup is needed.

## 🚀 Starting the Environment

1. **Launch the Vagrant VM**:
   ```bash
   vagrant up
   ```
   - This provisions an Ubuntu 22.04 VM, installs Docker, clones the `master` branch of the repository, and deploys the application using Docker Compose.
   - The process takes 5-10 minutes depending on your internet speed and system resources.
   - Ansible roles (`common_config`, `docker_setup`, `app_deployment`, `mongodb_setup`) configure the VM and deploy services.

2. **Access the Application**:
   - **Frontend**: `http://localhost:3000` (storefront and admin dashboard)
   - **Backend API**: `http://localhost:5000/api/product` (REST API)
   - **MongoDB**: `localhost:27017` (optional, for database access via MongoDB client)

3. **Verify Running Containers**:
   SSH into the VM to check Docker containers:
   ```bash
   vagrant ssh
   docker ps
   ```
   Expected: Containers for `mulikevs-yolo-client`, `mulikevs-yolo-backend`, and `app-mongo`.

## 🛑 Stopping the Environment

1. **Stop the Application**:
   ```bash
   vagrant ssh
   cd /home/vagrant/yolo
   docker compose down
   ```

2. **Halt the VM**:
   ```bash
   vagrant halt
   ```

3. **Destroy the VM** (optional):
   ```bash
   vagrant destroy
   ```

## 🔍 Interacting with the Environment

- **Frontend**:
  - Open `http://localhost:3000` in a browser to access the React storefront or admin dashboard.
  - Browse products or manage inventory via the UI.

- **Backend API**:
  - Base URL: `http://localhost:5000/api/product`
  - Endpoints:
    - `GET /`: List all products
    - `POST /`: Add a product (JSON payload: `{ "name": "string", "price": number }`)
    - `PUT /:id`: Update a product
    - `DELETE /:id`: Delete a product
  - Test with `curl` or Postman:
    ```bash
    curl http://localhost:5000/api/product
    ```

- **MongoDB**:
  - Connect to `localhost:27017` using a MongoDB client (e.g., MongoDB Compass).
  - Database: `yolomy` (configured in `backend/server.js`).

## 🧼 Troubleshooting

- **Port Conflicts**:
  - Check for processes on ports 3000, 5000, or 27017:
    ```bash
    sudo lsof -i :3000
    sudo kill -9 <PID>
    ```
  - Alternatively, edit `Vagrantfile` to map different host ports:
    ```ruby
    config.vm.network "forwarded_port", guest: 3000, host: 3001
    ```

- **Docker Compose Errors**:
  - Check logs:
    ```bash
    vagrant ssh
    cd /home/vagrant/yolo
    docker compose logs
    ```
  - Ensure `client/Dockerfile` and `backend/Dockerfile` are valid.

- **MongoDB Conflicts**:
  - The `mongodb_setup` role may install a native MongoDB instance, conflicting with the Dockerized `app-mongo`. To use only the Dockerized MongoDB:
    - Edit `playbook.yaml` to exclude `mongodb_setup`:
      ```yaml
      roles:
        - common_config
        - docker_setup
        - app_deployment
      ```
    - Re-provision:
      ```bash
      vagrant provision
      ```

- **Repository Clone Issues**:
  - Verify the `master` branch:
    ```bash
    git ls-remote https://github.com/mulikevs/yolo.git master
    ```
  - For private repositories, add SSH keys to the VM or update `vars.yml` with credentials.

- **Vagrant Provisioning Errors**:
  - Check Vagrant logs:
    ```bash
    vagrant up --debug
    ```
  - Re-provision if needed:
    ```bash
    vagrant provision
    ```

## 🌐 Kubernetes Deployment on GKE

For deploying the application on Google Kubernetes Engine (GKE) with Kubernetes manifests, refer to the dedicated Kubernetes README:
- [yolo-kubernetes/README.md](yolo-kubernetes/README.md)

This includes instructions for setting up a GKE cluster, applying manifests, and accessing the application via external IPs (`http://34.28.28.204` for frontend, `http://34.45.210.248/api/products` for backend).