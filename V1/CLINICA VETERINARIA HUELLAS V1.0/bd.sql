-- =====================================================================
--  HUELLA · Clínica veterinaria
--  Crea la base de datos DESDE CERO (borra la anterior si existe).
--  Ejecutar en MySQL 8+:   mysql -u root -p < database/schema.sql
-- =====================================================================
DROP DATABASE IF EXISTS huella_db;
CREATE DATABASE huella_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE huella_db;

-- ---------------------------------------------------------------------
-- Usuarios (todos los roles). Solo los propietarios se registran solos.
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(30)  NULL,
  role          ENUM('admin','vet','reception','owner') NOT NULL DEFAULT 'owner',
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Mascotas (pacientes). Cada mascota pertenece a un propietario.
-- ---------------------------------------------------------------------
CREATE TABLE pets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  owner_id    INT          NOT NULL,
  name        VARCHAR(80)  NOT NULL,
  species     ENUM('perro','gato','ave','conejo','reptil','otro') NOT NULL,
  breed       VARCHAR(80)  NULL,
  sex         ENUM('macho','hembra') NOT NULL,
  age_years   DECIMAL(4,1) NULL,
  weight_kg   DECIMAL(5,2) NULL,
  notes       TEXT         NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_pet_owner_name (owner_id, name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Citas. El propietario puede SOLICITAR reprogramar/cancelar;
-- recepción aprueba, reprograma o cancela directamente.
-- ---------------------------------------------------------------------
CREATE TABLE appointments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pet_id          INT          NOT NULL,
  vet_id          INT          NULL,
  appt_date       DATE         NOT NULL,
  appt_time       TIME         NOT NULL,
  reason          VARCHAR(160) NOT NULL DEFAULT 'Consulta general',
  status          ENUM('pending','confirmed','arrived','waiting','completed','cancelled') NOT NULL DEFAULT 'pending',
  request_type    ENUM('reschedule','cancel') NULL,
  requested_date  DATE         NULL,
  requested_time  TIME         NULL,
  request_note    VARCHAR(255) NULL,
  created_by      INT          NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appt_pet     FOREIGN KEY (pet_id)     REFERENCES pets(id)  ON DELETE CASCADE,
  CONSTRAINT fk_appt_vet     FOREIGN KEY (vet_id)     REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_appt_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_appt_date (appt_date, appt_time),
  INDEX idx_appt_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Historias clínicas (una por consulta)
-- ---------------------------------------------------------------------
CREATE TABLE medical_records (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pet_id          INT          NOT NULL,
  vet_id          INT          NOT NULL,
  appointment_id  INT          NULL,
  visit_date      DATE         NOT NULL,
  reason          VARCHAR(160) NOT NULL,
  symptoms        TEXT         NULL,
  diagnosis       TEXT         NOT NULL,
  treatment       TEXT         NULL,
  weight_kg       DECIMAL(5,2) NULL,
  temperature_c   DECIMAL(4,1) NULL,
  notes           TEXT         NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mr_pet  FOREIGN KEY (pet_id)         REFERENCES pets(id)         ON DELETE CASCADE,
  CONSTRAINT fk_mr_vet  FOREIGN KEY (vet_id)         REFERENCES users(id),
  CONSTRAINT fk_mr_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  INDEX idx_mr_pet (pet_id, visit_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Recetas / prescripciones asociadas a una consulta
-- ---------------------------------------------------------------------
CREATE TABLE prescriptions (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  medical_record_id INT          NOT NULL,
  pet_id            INT          NOT NULL,
  vet_id            INT          NOT NULL,
  medication        VARCHAR(120) NOT NULL,
  dose              VARCHAR(80)  NOT NULL,
  frequency         VARCHAR(80)  NOT NULL,
  duration_days     INT          NOT NULL,
  instructions      TEXT         NULL,
  valid_until       DATE         NOT NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rx_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_rx_pet    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_rx_vet    FOREIGN KEY (vet_id) REFERENCES users(id),
  INDEX idx_rx_pet (pet_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Vacunas aplicadas y próxima dosis programada
-- ---------------------------------------------------------------------
CREATE TABLE vaccinations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pet_id          INT          NOT NULL,
  vet_id          INT          NOT NULL,
  vaccine_name    VARCHAR(120) NOT NULL,
  applied_date    DATE         NOT NULL,
  next_dose_date  DATE         NULL,
  lot_number      VARCHAR(60)  NULL,
  notes           TEXT         NULL,
  reminder_sent   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vac_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_vac_vet FOREIGN KEY (vet_id) REFERENCES users(id),
  INDEX idx_vac_next (next_dose_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Urgencias registradas por recepción (síntoma + correo del propietario)
-- ---------------------------------------------------------------------
CREATE TABLE urgencies (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(160) NOT NULL,
  owner_email  VARCHAR(160) NULL,
  owner_id     INT          NULL,
  pet_id       INT          NULL,
  symptoms     TEXT         NOT NULL,
  status       ENUM('open','attended','closed') NOT NULL DEFAULT 'open',
  created_by   INT          NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_urg_owner   FOREIGN KEY (owner_id)   REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_urg_pet     FOREIGN KEY (pet_id)     REFERENCES pets(id)  ON DELETE SET NULL,
  CONSTRAINT fk_urg_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Notificaciones y alertas (las reciben los propietarios)
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  type        ENUM('vaccine','appointment','medical_record','prescription','urgency','general') NOT NULL DEFAULT 'general',
  title       VARCHAR(160) NOT NULL,
  message     TEXT         NOT NULL,
  ref_table   VARCHAR(40)  NULL,
  ref_id      INT          NULL,
  sent_by     INT          NULL,
  read_at     DATETIME     NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_sender FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_notif_user (user_id, read_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Cuentas fijas del personal (contraseña: 123, cifrada con bcrypt)
-- ---------------------------------------------------------------------
INSERT INTO users (full_name, email, password_hash, phone, role) VALUES
  ('Administrador Huella', 'admin@x.com',         '$2a$10$Cow/SgWscwG84/wkZrNtlOZX63WaawuBD0L9d2KRK.F/KotY/VPvq', '3000000001', 'admin'),
  ('Dr. Veterinario',      'veterinario@x.com',   '$2a$10$Cow/SgWscwG84/wkZrNtlOZX63WaawuBD0L9d2KRK.F/KotY/VPvq', '3000000002', 'vet'),
  ('Recepcionista Huella', 'recepcionista@x.com', '$2a$10$Cow/SgWscwG84/wkZrNtlOZX63WaawuBD0L9d2KRK.F/KotY/VPvq', '3000000003', 'reception');