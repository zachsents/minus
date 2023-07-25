# Grabbed most of this config from here:
# https://firebase.google.com/docs/projects/terraform/get-started


# ====== Provider Configuration ======


# Terraform configuration to set up providers by version.
terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}

# Configures the provider to use the resource block's specified project for quota checks.
provider "google-beta" {
  user_project_override = true
}

# Configures the provider to not use the resource block's specified project for quota checks.
# This provider should only be used during project creation and initializing services.
provider "google-beta" {
  alias                 = "no_user_project_override"
  user_project_override = false
}


# ====== GC Project ======


# Create Google Cloud project
resource "google_project" "default" {
  provider = google-beta.no_user_project_override

  name       = "Minus"
  project_id = var.gcloud_project
  # Required for any service that requires the Blaze pricing plan
  # (like Firebase Authentication with GCIP)
  billing_account = var.gcloud_billing_account

  # Required for the project to display in any list of Firebase projects.
  labels = {
    "firebase" = "enabled"
  }
}

# Enables required APIs
resource "google_project_service" "default" {
  provider = google-beta.no_user_project_override
  project  = google_project.default.project_id
  for_each = toset([
    "cloudbilling.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "firebase.googleapis.com",
    # Enabling the ServiceUsage API allows the new project to be quota checked from now on.
    "serviceusage.googleapis.com",
  ])
  service = each.key

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}


# ====== Firebase Project ======


# Create Firebase project
resource "google_firebase_project" "default" {
  provider = google-beta
  project  = google_project.default.project_id

  # Waits for the required APIs to be enabled.
  depends_on = [
    google_project_service.default
  ]
}

# Web app
resource "google_firebase_web_app" "default" {
  provider = google-beta

  project      = google_project.default.project_id
  display_name = "Web Client"

  # Wait for Firebase to be enabled in the Google Cloud project before creating this App.
  depends_on = [
    google_firebase_project.default,
  ]
}

# Enable Firestore
resource "google_project_service" "firestore" {
  project    = google_project.default.project_id
  service    = "firestore.googleapis.com"
  depends_on = [google_firebase_project.default]
}

# Create Firestore database (default)
resource "google_firestore_database" "database" {
  project     = google_project.default.project_id
  name        = "(default)"
  location_id = "nam5"
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.firestore]
}
