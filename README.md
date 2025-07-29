# 🛍️ YOLO E-Commerce Application

The YOLO E-Commerce Application is a full-stack platform featuring a customer-facing storefront and an admin dashboard for managing products. Built with **React** for the frontend, **Node.js/Express** for the backend, and **MongoDB** for the database, it uses a microservices architecture deployed via Docker containers. This project leverages **Vagrant** and **Ansible** for automated provisioning and orchestration on an Ubuntu 22.04 virtual machine.

## 🚀 Overview

This project demonstrates:
- A microservices-based e-commerce platform with separate frontend, backend, and database services.
- Automated provisioning using Vagrant and Ansible.
- Containerized deployment with Docker and Docker Compose.
- REST API for product management and a responsive React-based UI.

| Layer      | Technology                       | Port  |
|------------|----------------------------------|-------|
| Frontend   | React                            | 3000  |
| Backend    | Node.js + Express                | 5000  |
| Database   | MongoDB (Dockerized)             | 27017 |
| DevOps     | Vagrant, Ansible, Docker Compose | -     |

## 📦 Prerequisites

To run this project, ensure you have the following installed:
- [Vagrant](https://www.vagrantup.com/downloads) 
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) 
- [Ansible](https://docs.ansible.com/ansible/lamaster/installation_guide/intro_installation.html) 
- Git (for cloning the repository)

Ensure your system has at least:
- Internet access for downloading the Vagrant box and Docker images

## 🛠️ Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/mulikevs/yolo.git
   cd yolo
   ```

2. **Install Dependencies**:
   - Ensure Vagrant and VirtualBox.
   - Ansible is executed by Vagrant, so no additional setup is needed on the host machine.

3. **Verify Project Structure**:
   Ensure the following files and directories exist:
   ```
   yolo/
   ├── backend/         
   ├── client/               
   ├── explanation.md
   ├── Vagrantfile
   ├── ansible.cfg
   ├── playbook.yaml
   ├── vars.yml
   ├── docker-compose.yaml
   ├── hosts/
   │   └── hosts
   ├── roles/
   │   ├── common_config/
   │   ├── docker_setup/
   │   ├── app_deployment/
   └── README.md
   ```

## 🚀 Starting the Environment

1. **Launch the Vagrant VM**:
   Run the following command to start the VM and provision it with Ansible:
   ```bash
   vagrant up
   ```
   - This creates an Ubuntu 22.04 VM, installs Docker, clones the `master` branch of the repository, and deploys the application using Docker Compose.
   - The process may take 5-10 minutes, depending on your internet speed and system resources.

2. **Access the Application**:
   Once provisioning is complete, access the services inside the VM:
   - **Frontend**: `http://localhost:3000` (React storefront and admin dashboard)
   - **Backend API**: `http://localhost:5000/api/product` (REST API for product management)
   - **MongoDB**: `localhost:27017` (optional, for database access)

3. **Verify Running Containers**:
   SSH into the VM to check the Docker containers:
   ```bash
   vagrant ssh
   docker ps
   ```
   You should see three containers: `mulikevs-yolo-client`, `mulikevs-yolo-backend`, and `app-mongo`.

## 🛑 Stopping the Environment

1. **Stop the Application**:
   SSH into the VM and stop the Docker Compose services:
   ```bash
   vagrant ssh
   cd /home/vagrant/yolo
   docker compose down
   ```

2. **Halt the VM**:
   Stop the Vagrant VM:
   ```bash
   vagrant halt
   ```

3. **Destroy the VM** (optional):
   To remove the VM and free up resources:
   ```bash
   vagrant destroy
   ```

## 🔍 Interacting with the Environment

- **Frontend**:
  - Navigate to `http://localhost:3000` to access the storefront or admin dashboard.
  - Use the UI to browse products or manage inventory.

- **Backend API**:
  - Base URL: `http://localhost:5000/api/product`
  - Example endpoints:
    - `GET /`: List all products
    - `POST /`: Add a product (requires JSON payload)
    - `PUT /:id`: Update a product
    - `DELETE /:id`: Delete a product
  - master with tools like `curl` or Postman:
    ```bash
    curl http://localhost:5000/api/product
    ```

- **MongoDB**:
  - Connect to the Dockerized MongoDB at `localhost:27017` using a MongoDB client (e.g., MongoDB Compass).
  - The database is named `yolomy` (based on backend configuration).

## 🧼 Troubleshooting

- **Port Conflicts**:
  - If ports 3000, 5000, or 27017 are in use, stop conflicting processes:
    ```bash
    sudo lsof -i :3000
    sudo kill -9 <PID>
    ```
  - Alternatively, modify the `Vagrantfile` to use different host ports.

- **Docker Compose Errors**:
  - If `docker compose up` fails, check the logs:
    ```bash
    vagrant ssh
    cd /home/vagrant/yolo
    docker compose logs
    ```
  - Ensure the `client` and `backend` directories contain valid `Dockerfile`s.

- **MongoDB Conflicts**:
  - The `mongodb_setup` role installs a native MongoDB instance, which may conflict with the Dockerized `app-mongo`. To use only the Dockerized MongoDB, edit `playbook.yaml` to skip the `mongodb_setup` role:
    ```yaml
    roles:
      - common_config
      - docker_setup
      - app_deployment
    ```
  - Re-provision the VM:
    ```bash
    vagrant provision
    ```

- **Repository Clone Issues**:
  - If the `master` branch clone fails, verify its existence:
    ```bash
    git ls-remote https://github.com/mulikevs/yolo.git master
    ```
  - For private repositories, add an SSH key to the VM or use credentials in `vars.yml`.
