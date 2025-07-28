# Explanation of YOLO E-Commerce Application - Stage 2

This document explains the hybrid automation stack for Stage 2 of the YOLO E-Commerce Application, using **Terraform** for infrastructure provisioning and **Ansible** for configuration management. It details the integration, orchestration flow, and customization options for deploying the application on an Ubuntu 22.04 VM.

## 📖 Purpose of Using Terraform and Ansible

- **Terraform**:
  - Provides Infrastructure as Code (IaC) to provision and manage infrastructure (VMs, networks) declaratively.
  - Ensures consistent, repeatable environments.
  - Supports multiple providers (e.g., libvirt, AWS, GCP) for flexibility.
- **Ansible**:
  - Handles configuration management, installing software, and deploying applications.
  - Idempotent tasks ensure safe, repeatable configurations.
  - Complements Terraform by configuring provisioned resources.
- **Why Both?**:
  - Terraform excels at creating infrastructure but lacks fine-grained configuration capabilities.
  - Ansible excels at configuring systems but doesn’t manage infrastructure lifecycle.
  - Together, they provide end-to-end automation: Terraform builds the VM, Ansible configures and deploys the app.

## 🔄 Orchestration Flow

1. **Initiate with `site.yml`**:
   - Run `ansible-playbook playbooks/site.yml` from `stage_two/ansible`.
   - The playbook has two plays:
     - **Local Play**: Runs Terraform on the host machine.
     - **Remote Play**: Configures the VM via SSH.

2. **Terraform Execution**:
   - **Initialize**: `terraform init` sets up the `libvirt` provider.
   - **Apply**: `terraform apply` creates:
     - An Ubuntu 22.04 VM (`yolo_vm`) with 2GB RAM, 2 CPUs.
     - A NAT network (`yolo_net`, `192.168.122.0/24`).
     - A disk image (`yolo_ubuntu.qcow2`) based on the Ubuntu QCOW2 file.
   - Outputs the VM IP address.
   - Cloud-init configures SSH access and basic setup.

3. **Dynamic Inventory Generation**:
   - `site.yml` extracts the VM IP from Terraform output.
   - Generates `ansible/inventory/hosts` using a Jinja2 template:
     ```ini
     [all]
     yolo_vm ansible_host=<vm_ip> ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
     ```

4. **Ansible Configuration**:
   - Waits for the VM to be SSH-accessible (port 22, timeout 300s).
   - Applies roles:
     - `common_config`: Installs system dependencies (`curl`, `python3-pip`).
     - `docker_setup`: Installs Docker and Docker Compose V2.
     - `app_deployment`:
       - Clones the `master` branch of `https://github.com/mulikevs/yolo.git`.
       - Copies `docker-compose.yaml`.
       - Starts containers (`mulikevs-yolo-client`, `mulikevs-yolo-backend`, `app-mongo`).

5. **Application Deployment**:
   - Docker Compose starts services on ports 3000, 5000, and 27017, accessible via the VM’s IP.

## 🛠️ Customization Options

- **Switch to Cloud Providers**:
  - Replace the `libvirt` provider with AWS:
    ```hcl
    provider "aws" {
      region = var.aws_region
    }

    resource "aws_instance" "yolo_vm" {
      ami           = var.ami_id
      instance_type = var.instance_type
      key_name      = var.key_name
      vpc_security_group_ids = [aws_security_group.yolo_sg.id]
    }
    ```
    - Update `variables.tf` with AWS-specific variables.
    - Modify `site.yml` to use AWS instance public IP.

- **Add Additional Services**:
  - Extend `docker-compose.yaml` for new services (e.g., Redis):
    ```yaml
    redis:
      image: redis:7.0
      ports:
        - "6379:6379"
      networks:
        - app-net
    ```
    - Create a new Ansible role:
      ```bash
      ansible-galaxy init ansible/roles/redis_setup
      ```

- **Scale Resources**:
  - Adjust VM specs in `variables.tf`:
    ```hcl
    variable "vm_memory" {
      default = 4096
    }
    variable "vm_vcpu" {
      default = 4
    }
    ```

- **Private Repository**:
  - Add SSH key to Terraform’s cloud-init:
    ```hcl
    user_data = templatefile("${path.module}/cloud_init.cfg", {
      ssh_public_key = file(var.ssh_public_key_path)
      ssh_private_key = file(var.ssh_private_key_path)
    })
    ```
    - Update `app_deployment`:
      ```yaml
      key_file: /home/ubuntu/.ssh/id_rsa
      ```

- **State Management**:
  - Use remote state for production:
    ```hcl
    terraform {
      backend "s3" {
        bucket = "yolo-terraform-state"
        key    = "state/terraform.tfstate"
        region = "us-east-1"
      }
    }
    ```

- **Security Hardening**:
  - Add firewall rules in `common_config`:
    ```yaml
    - name: Configure UFW
      ufw:
        rule: allow
        port: "{{ item }}"
      loop:
        - 3000
        - 5000
        - 27017
    ```

## 📌 Notes

- **MongoDB**: Uses Dockerized `mongo:7.0.12` to avoid conflicts with native installations.
- **Idempotency**: Ansible roles are idempotent; Terraform applies changes incrementally.
- **Port Forwarding**: Limited by `libvirt` NAT; for cloud providers, use security groups.