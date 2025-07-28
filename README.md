# 🛍️ YOLO E-Commerce Application - Stage 2

The YOLO E-Commerce Application is a full-stack platform with a customer-facing storefront and admin dashboard, built using **React** (frontend), **Node.js/Express** (backend), and **MongoDB** (database). Stage 2 automates infrastructure provisioning and configuration using **Terraform** and **Ansible**, deploying the application on an Ubuntu 22.04 virtual machine (VM) with Docker containers.

## 🚀 Overview

This setup demonstrates:
- Infrastructure as Code (IaC) using Terraform to provision a VM and networking.
- Configuration management with Ansible to install dependencies and deploy the application.
- Microservices deployment via Docker Compose.
- Integrated orchestration with a single Ansible playbook (`site.yml`).

| Layer      | Technology                       | Port  |
|------------|----------------------------------|-------|
| Frontend   | React                            | 3000  |
| Backend    | Node.js + Express                | 5000  |
| Database   | MongoDB (Dockerized)             | 27017 |
| DevOps     | Terraform, Ansible, Docker       | -     |

## 📦 Prerequisites

- **Tools**:
  - [Terraform](https://www.terraform.io/downloads.html) (1.5.0 or later)
  - [Ansible](https://docs.ansible.com/ansible/lamaster/installation_guide/intro_installation.html) (2.12 or later)
  - [Vagrant](https://www.vagrantup.com/downloads) (optional, for libvirt provider setup)
  - [libvirt](https://libvirt.org/) with KVM/QEMU (for VM provisioning)
  - Git
- **System Requirements**:
  - 4GB RAM, 10GB disk space
  - Ubuntu host (or compatible Linux with libvirt)
  - SSH key pair (`~/.ssh/id_rsa`, `~/.ssh/id_rsa.pub`)
- **Ubuntu Image**:
  - Download Ubuntu 22.04 QCOW2 image and place it at `/var/lib/libvirt/images/ubuntu-22.04-minimal.qcow2`:
    ```bash
    sudo wget -O /var/lib/libvirt/images/ubuntu-22.04-minimal.qcow2 https://cloud-images.ubuntu.com/minimal/releases/jammy/release/ubuntu-22.04-minimal-cloudimg-amd64.img
    ```

## 🛠️ Installation

1. **Clone the Repository and Switch to stage_two Branch**:
   ```bash
   git clone https://github.com/mulikevs/yolo.git
   cd yolo
   git checkout stage_two
   cd stage_two
   ```

2. **Verify Directory Structure**:
   ```
   stage_two/
   ├── terraform/
   │   ├── main.tf
   │   ├── variables.tf
   │   ├── cloud_init.cfg
   ├── ansible/
   │   ├── playbooks/
   │   │   ├── site.yml
   │   │   ├── inventory.j2
   │   ├── roles/
   │   │   ├── common_config/
   │   │   ├── docker_setup/
   │   │   ├── app_deployment/
   │   ├── inventory/
   │   │   ├── hosts
   │   ├── ansible.cfg
   ├── vars.yml
   ├── docker-compose.yaml
   ├── README.md
   └── explanation.md
   ```

3. **Install Dependencies**:
   - Ensure Terraform, Ansible, and libvirt are installed:
     ```bash
     sudo apt update
     sudo apt install -y terraform qemu-kvm libvirt-daemon-system libvirt-clients
     ```
   - Verify libvirt service:
     ```bash
     sudo systemctl enable --now libvirtd
     ```

## 🚀 Deploying the Application

1. **Run the Full Stack**:
   Execute the `site.yml` playbook to provision infrastructure and configure the VM:
   ```bash
   cd stage_two/ansible
   ansible-playbook playbooks/site.yml
   ```
   - **What Happens**:
     - Terraform provisions an Ubuntu 22.04 VM with port forwarding (3000, 5000, 27017).
     - Ansible installs Docker, clones the `master` branch, and deploys the application via Docker Compose.
     - The process takes 5-10 minutes.

2. **Access the Application**:
   - **Frontend**: `http://<vm_ip>:3000` (React storefront/admin dashboard)
   - **Backend API**: `http://<vm_ip>:5000/api/product` (REST API)
   - **MongoDB**: `<vm_ip>:27017` (optional, for database access)
   - Find `<vm_ip>` in `terraform/terraform.tfstate` or `ansible/inventory/hosts`.

3. **Verify Containers**:
   SSH into the VM to check Docker containers:
   ```bash
   ssh -i ~/.ssh/id_rsa ubuntu@<vm_ip>
   docker ps
   ```
   Expected containers: `mulikevs-yolo-client`, `mulikevs-yolo-backend`, `app-mongo`.

## 🛑 Stopping the Environment

1. **Stop Docker Compose**:
   ```bash
   ssh -i ~/.ssh/id_rsa ubuntu@<vm_ip>
   cd /home/ubuntu/yolo
   docker-compose -f docker-compose.yaml down
   ```

2. **Destroy Infrastructure**:
   ```bash
   cd stage_two/terraform
   terraform destroy -auto-approve
   ```

## 🔧 Terraform and Ansible Integration

- **Terraform**:
  - Provisions the VM and network using the `libvirt` provider.
  - Outputs the VM IP address for Ansible.
- **Ansible**:
  - The `site.yml` playbook:
    - Runs `terraform init` and `terraform apply` locally.
    - Extracts the VM IP and generates a dynamic inventory.
    - Applies roles (`common_config`, `docker_setup`, `app_deployment`) to configure the VM.
- **Flow**:
  - `site.yml` executes Terraform first (`local-exec`), then Ansible (`remote-exec` via SSH).
  - Dynamic inventory ensures Ansible targets the newly provisioned VM.

## 📁 Structure Overview

- **`terraform/`**: Contains Terraform configurations (`main.tf`, `variables.tf`, `cloud_init.cfg`) for VM and network provisioning.
- **`ansible/`**:
  - `playbooks/site.yml`: Orchestrates Terraform and Ansible.
  - `roles/`: Modular roles for system setup, Docker, and app deployment.
  - `inventory/`: Dynamic hosts file generated from Terraform output.
  - `ansible.cfg`: Ansible configuration.
- **`vars.yml`**: Global variables (e.g., `project_dir`, `repo_url`).
- **`docker-compose.yaml`**: Defines microservices.

## 🧼 Troubleshooting

- **Terraform Errors**:
  - Ensure the Ubuntu QCOW2 image exists:
    ```bash
    ls /var/lib/libvirt/images/ubuntu-22.04-minimal.qcow2
    ```
  - Check libvirt permissions:
    ```bash
    sudo usermod -aG libvirt $USER
    ```

- **Ansible Connection Issues**:
  - Verify SSH access:
    ```bash
    ssh -i ~/.ssh/id_rsa ubuntu@<vm_ip>
    ```
  - Ensure the SSH key is correct in `vars.yml`.

- **Docker Compose Failures**:
  - Check logs:
    ```bash
    ssh -i ~/.ssh/id_rsa ubuntu@<vm_ip>
    cd /home/ubuntu/yolo
    docker-compose logs
    ```
  - Ensure `client` and `backend` directories have valid `Dockerfile`s.

- **Port Access**:
  - If `<vm_ip>:3000` is inaccessible, check VM firewall:
    ```bash
    ssh -i ~/.ssh/id_rsa ubuntu@<vm_ip>
    sudo ufw allow 3000
    ```