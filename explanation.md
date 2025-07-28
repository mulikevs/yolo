# Explanation of YOLO E-Commerce Application Setup

This document explains the provisioning process for the YOLO E-Commerce Application, a full-stack platform using React, Node.js/Express, and MongoDB, deployed on an Ubuntu 22.04 virtual machine (VM) via Vagrant and Ansible. It details how the `Vagrantfile` and `playbook.yaml` work together, the provisioning workflow, and customization options for different environments.

## 📖 Overview

The project uses:
- **Vagrant**: To create and manage an Ubuntu 22.04 VM (`generic/ubuntu2204`).
- **Ansible**: To provision the VM with Docker, Docker Compose, and the application.
- **Docker Compose**: To deploy microservices (frontend, backend, MongoDB) in containers.
- **Git**: To clone the `master` branch of the repository (`https://github.com/mulikevs/yolo.git`).

The setup automates:
- VM creation and networking configuration.
- Installation of system dependencies, Docker, and Docker Compose.
- Cloning the application repository and deploying services.

## 🛠️ Vagrantfile Breakdown

The `Vagrantfile` defines the VM configuration and triggers Ansible provisioning.

### Key Components
- **Box**: `config.vm.box = "generic/ubuntu2204"`
  - Uses the `generic/ubuntu2204` Vagrant box, providing a clean Ubuntu 22.04 environment.
- **Network**:
  - Port forwarding:
    ```ruby
    config.vm.network "forwarded_port", guest: 3000, host: 3000
    config.vm.network "forwarded_port", guest: 5000, host: 5000
    ```
    - Maps VM ports (3000, 5000, 27017) to host ports, enabling access to the frontend, backend, and MongoDB.
- **Ansible Provisioner**:
  - ```ruby
    config.vm.provision :ansible do |ansible|
      ansible.playbook = "playbook.yaml"
      ansible.verbose = "v"
    end
    ```
    - Executes `playbook.yaml` to provision the VM.
    - Enables verbose output (`-v`) for debugging.

### Workflow
1. Vagrant downloads the `generic/ubuntu2204` box (if not cached).
2. Creates a VirtualBox VM with forwarded ports.
3. Runs Ansible to execute `playbook.yaml` on the VM.

## 📜 playbook.yaml Breakdown

The `playbook.yaml` orchestrates the provisioning process using Ansible roles.

### Structure
- **Hosts**: `hosts: all`
  - Targets all hosts in the inventory (`hosts/hosts`).
- **Privilege Escalation**: `become: true`
  - Runs tasks with `sudo` privileges for system modifications.
- **Variables**: `vars_files: - vars.yml`
  - Loads variables from `vars.yml` (e.g., `project_dir`, `repo_url`).
- **Pre-tasks**:
  - Creates the project directory (`/home/vagrant/yolo`):
    ```yaml
    - name: Create project directory
      file:
        path: "{{ project_dir }}"
        state: directory
        owner: vagrant
        group: vagrant
        mode: '0755'
    ```
- **Roles**:
  - Applies four roles in order:
    - `common_config`: Installs system dependencies (e.g., `curl`, `python3-pip`).
    - `docker_setup`: Installs Docker and Docker Compose V2.
    - `app_deployment`: Clones the repository, copies `docker-compose.yaml`, and starts the application.

### Key Roles
1. **common_config**:
   - Updates the system (`apt update && apt upgrade`).
   - Installs dependencies like `apt-transport-https`, `python3-pip`, and `pymongo`.
2. **docker_setup**:
   - Installs Docker from the official repository.
   - Downloads Docker Compose V2 binary (`v2.24.0`).
   - Adds the `vagrant` user to the `docker` group.
3. **app_deployment**:
   - Clones the `master` branch of `https://github.com/mulikevs/yolo.git` to `/home/vagrant/yolo`.
   - Copies `docker-compose.yaml` to the project directory.
   - Creates `backend` and `client` directories.
   - Runs `docker-compose up -d` to start the services.

## 🔄 Provisioning Process

1. **Vagrant Initialization**:
   - `vagrant up` creates the VM and configures networking (port forwarding).
   - Vagrant mounts the project directory as a synced folder and triggers Ansible.

2. **Ansible Execution**:
   - Ansible reads `ansible.cfg` and the inventory (`hosts/hosts`).
   - Executes `playbook.yaml`:
     - **Pre-tasks**: Creates `/home/vagrant/yolo`.
     - **common_config**: Sets up system dependencies.
     - **docker_setup**: Installs Docker and Docker Compose.
     - **mongodb_setup**: Configures native MongoDB (optional).
     - **app_deployment**:
       - Checks if `/home/vagrant/yolo/.git` exists.
       - Removes the directory if it’s not a Git repository.
       - Clones or updates the `master` branch.
       - Copies `docker-compose.yaml`.
       - Runs `docker-compose up -d` to start the frontend, backend, and MongoDB containers.

3. **Application Deployment**:
   - Docker Compose starts three services:
     - `mulikevs-yolo-client`: React frontend on port 3000.
     - `mulikevs-yolo-backend`: Node.js/Express backend on port 5000.
     - `app-ip-mongo`: MongoDB on port 27017.
   - Containers communicate over the `app-net` bridge network.

## 🛠️ Customization Tips

- **Change Vagrant Box**:
  - Replace `generic/ubuntu2204` with another box (e.g., `ubuntu/focal64`):
    ```ruby
    config.vm.box = "ubuntu/focal64"
    ```
  - Update Ansible tasks for compatibility with the new distribution.

- **Adjust VM Resources**:
  - Modify CPU and memory in the `Vagrantfile`:
    ```ruby
    config.vm.provider "virtualbox" do |vb|
      vb.memory = "2048"
      vb.cpus = 2
    end
    ```

- **Use Dockerized MongoDB Only**:
  - Remove the `mongodb_setup` role from `playbook.yaml` to avoid conflicts:
    ```yaml
    roles:
      - common_config
      - docker_setup
      - app_deployment
    ```
  - Ensure the backend connects to `mongodb://app-ip-mongo:27017/yolomy`.

- **Environment Variables**:
  - Add environment variables to `docker-compose.yaml`:
    ```yaml
    mulikevs-yolo-backend:
      environment:
        - MONGO_URI=mongodb://app-ip-mongo:27017/yolomy
    ```
  - Update `vars.yml` with custom variables:
    ```yaml
    mongo_uri: mongodb://app-ip-mongo:27017/yolomy
    ```

- **Production Deployment**:
  - Use a cloud provider (e.g., AWS EC2) instead of Vagrant.
  - Replace the Vagrant box with an Ansible inventory targeting the cloud instance.
  - Add security configurations (e.g., firewall rules, SSL) in the `common_config` role.

## 📌 Notes

- The `docker-compose.yaml` uses `mongo:7.0.12` for SemVer compliance, avoiding the ambiguous `mongo:lamaster`.
- The `master` branch must contain valid `Dockerfile`s in `client` and `backend` directories for the build to succeed.
- Ansible roles are idempotent, ensuring safe re-provisioning with `vagrant provision`.
