-- ============================================================
-- Internal Feedback System — Schema v3
-- Redesigned against 39 captured frontend screens
-- (Student / Faculty / HOD-scoped Admin / Administrator-all-dept)
-- MySQL 8.0+ / MariaDB 10.4+
-- ============================================================

CREATE DATABASE IF NOT EXISTS internal_feedback_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE internal_feedback_system;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS feedback_answer;
DROP TABLE IF EXISTS feedback_response;
DROP TABLE IF EXISTS feedback_question_option;
DROP TABLE IF EXISTS feedback_question;
DROP TABLE IF EXISTS feedback_form;
DROP TABLE IF EXISTS feedback_question_category;
DROP TABLE IF EXISTS teaching_assignment;
DROP TABLE IF EXISTS student_elective_enrollment;
DROP TABLE IF EXISTS subject_offering;
DROP TABLE IF EXISTS subject;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS section;
DROP TABLE IF EXISTS division;
DROP TABLE IF EXISTS batch;
DROP TABLE IF EXISTS semester;
DROP TABLE IF EXISTS academic_year;
DROP TABLE IF EXISTS report;
DROP TABLE IF EXISTS data_import_log;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS designation;
DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS user_account;

-- ============================================================
-- 1. IDENTITY — single login table for all three portals
-- ============================================================

CREATE TABLE user_account (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN','FACULTY','STUDENT') NOT NULL,
    status ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    last_login_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. ORG STRUCTURE
-- ============================================================

CREATE TABLE designation (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    designation_name VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB;

CREATE TABLE department (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(10) NOT NULL UNIQUE,
    department_name VARCHAR(200) NOT NULL,
    hod_faculty_id BIGINT UNSIGNED NULL,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE faculty (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_account_id BIGINT UNSIGNED NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    mobile VARCHAR(30) NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    designation_id BIGINT UNSIGNED NULL,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_faculty_user_account
        FOREIGN KEY (user_account_id) REFERENCES user_account(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_faculty_department
        FOREIGN KEY (department_id) REFERENCES department(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_faculty_designation
        FOREIGN KEY (designation_id) REFERENCES designation(id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_faculty_department (department_id)
) ENGINE=InnoDB;

ALTER TABLE department
    ADD CONSTRAINT fk_department_hod
        FOREIGN KEY (hod_faculty_id) REFERENCES faculty(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    ADD UNIQUE KEY uk_department_hod (hod_faculty_id);

-- ============================================================
-- 3. ACADEMIC CALENDAR
-- ============================================================

CREATE TABLE academic_year (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    year_code VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NULL,
    end_date DATE NULL,
    status ENUM('PLANNED','ACTIVE','CLOSED') NOT NULL DEFAULT 'PLANNED'
) ENGINE=InnoDB;

CREATE TABLE semester (
    id TINYINT UNSIGNED PRIMARY KEY,
    semester_no TINYINT UNSIGNED NOT NULL UNIQUE,
    term ENUM('ODD','EVEN') NOT NULL
) ENGINE=InnoDB;

-- ============================================================
-- 4. COHORTS & SECTIONS
-- ============================================================

CREATE TABLE batch (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT UNSIGNED NOT NULL,
    program_name VARCHAR(100) NOT NULL,
    batch_title VARCHAR(150) NOT NULL,
    admission_year SMALLINT UNSIGNED NOT NULL,
    graduation_year SMALLINT UNSIGNED NOT NULL,
    current_semester_id TINYINT UNSIGNED NULL,
    status ENUM('ACTIVE','GRADUATED','DISCONTINUED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_batch_department
        FOREIGN KEY (department_id) REFERENCES department(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_batch_semester
        FOREIGN KEY (current_semester_id) REFERENCES semester(id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_batch_department (department_id)
) ENGINE=InnoDB;

CREATE TABLE division (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    semester_id TINYINT UNSIGNED NOT NULL,
    division_code VARCHAR(10) NOT NULL,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    UNIQUE KEY uk_division (batch_id, semester_id, division_code),
    CONSTRAINT fk_division_department
        FOREIGN KEY (department_id) REFERENCES department(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_division_batch
        FOREIGN KEY (batch_id) REFERENCES batch(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_division_semester
        FOREIGN KEY (semester_id) REFERENCES semester(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    INDEX idx_division_batch (batch_id)
) ENGINE=InnoDB;

DELIMITER $$
CREATE TRIGGER trg_division_department_matches_batch
BEFORE INSERT ON division
FOR EACH ROW
BEGIN
    DECLARE v_batch_department_id BIGINT UNSIGNED;
    SELECT department_id INTO v_batch_department_id FROM batch WHERE id = NEW.batch_id;
    IF v_batch_department_id IS NULL OR v_batch_department_id <> NEW.department_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'division.department_id must match batch.department_id';
    END IF;
END$$
DELIMITER ;

CREATE TABLE section (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    division_id BIGINT UNSIGNED NOT NULL,
    section_code VARCHAR(10) NOT NULL,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    UNIQUE KEY uk_section (division_id, section_code),
    CONSTRAINT fk_section_division
        FOREIGN KEY (division_id) REFERENCES division(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    INDEX idx_section_division (division_id)
) ENGINE=InnoDB;

CREATE TABLE student (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_account_id BIGINT UNSIGNED NULL UNIQUE,
    roll_no VARCHAR(50) NOT NULL UNIQUE,
    enrollment_no VARCHAR(50) NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NULL,
    mobile VARCHAR(30) NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    division_id BIGINT UNSIGNED NOT NULL,
    section_id BIGINT UNSIGNED NOT NULL,
    status ENUM('ACTIVE','INACTIVE','GRADUATED','WITHDRAWN') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_user_account
        FOREIGN KEY (user_account_id) REFERENCES user_account(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_student_department
        FOREIGN KEY (department_id) REFERENCES department(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_student_batch
        FOREIGN KEY (batch_id) REFERENCES batch(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_student_division
        FOREIGN KEY (division_id) REFERENCES division(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_student_section
        FOREIGN KEY (section_id) REFERENCES section(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    INDEX idx_student_batch (batch_id),
    INDEX idx_student_division (division_id),
    INDEX idx_student_section (section_id)
) ENGINE=InnoDB;

DELIMITER $$
CREATE TRIGGER trg_student_hierarchy_before_insert
BEFORE INSERT ON student
FOR EACH ROW
BEGIN
    DECLARE v_division_batch_id BIGINT UNSIGNED;
    DECLARE v_section_division_id BIGINT UNSIGNED;

    SELECT batch_id INTO v_division_batch_id FROM division WHERE id = NEW.division_id;
    IF v_division_batch_id IS NULL OR v_division_batch_id <> NEW.batch_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'student.division_id does not belong to student.batch_id';
    END IF;

    SELECT division_id INTO v_section_division_id FROM section WHERE id = NEW.section_id;
    IF v_section_division_id IS NULL OR v_section_division_id <> NEW.division_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'student.section_id does not belong to student.division_id';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_student_hierarchy_before_update
BEFORE UPDATE ON student
FOR EACH ROW
BEGIN
    DECLARE v_division_batch_id BIGINT UNSIGNED;
    DECLARE v_section_division_id BIGINT UNSIGNED;

    SELECT batch_id INTO v_division_batch_id FROM division WHERE id = NEW.division_id;
    IF v_division_batch_id IS NULL OR v_division_batch_id <> NEW.batch_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'student.division_id does not belong to student.batch_id';
    END IF;

    SELECT division_id INTO v_section_division_id FROM section WHERE id = NEW.section_id;
    IF v_section_division_id IS NULL OR v_section_division_id <> NEW.division_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'student.section_id does not belong to student.division_id';
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- 5. SUBJECTS
-- ============================================================

CREATE TABLE subject (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(250) NOT NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    semester_id TINYINT UNSIGNED NOT NULL,
    course_type ENUM('CORE','ELECTIVE') NOT NULL DEFAULT 'CORE',
    credits DECIMAL(3,1) NOT NULL DEFAULT 0,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_subject_department
        FOREIGN KEY (department_id) REFERENCES department(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_subject_semester
        FOREIGN KEY (semester_id) REFERENCES semester(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    INDEX idx_subject_department (department_id)
) ENGINE=InnoDB;

CREATE TABLE subject_offering (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    academic_year_id BIGINT UNSIGNED NOT NULL,
    enrollment_capacity INT UNSIGNED NOT NULL,
    status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',

    UNIQUE KEY uk_subject_offering (subject_id, batch_id, academic_year_id),
    CONSTRAINT fk_offering_subject
        FOREIGN KEY (subject_id) REFERENCES subject(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_offering_batch
        FOREIGN KEY (batch_id) REFERENCES batch(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_offering_academic_year
        FOREIGN KEY (academic_year_id) REFERENCES academic_year(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

DELIMITER $$
CREATE TRIGGER trg_offering_must_be_elective
BEFORE INSERT ON subject_offering
FOR EACH ROW
BEGIN
    DECLARE v_course_type VARCHAR(10);
    SELECT course_type INTO v_course_type FROM subject WHERE id = NEW.subject_id;
    IF v_course_type <> 'ELECTIVE' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'subject_offering rows are only valid for ELECTIVE subjects';
    END IF;
END$$
DELIMITER ;

CREATE TABLE student_elective_enrollment (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL,
    subject_offering_id BIGINT UNSIGNED NOT NULL,
    status ENUM('ENROLLED','DROPPED') NOT NULL DEFAULT 'ENROLLED',
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_student_offering (student_id, subject_offering_id),
    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id) REFERENCES student(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_offering
        FOREIGN KEY (subject_offering_id) REFERENCES subject_offering(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- 6. SESSION ALLOCATIONS (Faculty <-> Subject <-> Batch/Division/Section)
-- ============================================================

CREATE TABLE teaching_assignment (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT UNSIGNED NOT NULL,
    faculty_id BIGINT UNSIGNED NOT NULL,
    batch_id BIGINT UNSIGNED NOT NULL,
    division_id BIGINT UNSIGNED NULL,
    section_id BIGINT UNSIGNED NULL,
    academic_year_id BIGINT UNSIGNED NOT NULL,
    semester_id TINYINT UNSIGNED NOT NULL,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_teaching_assignment
        (subject_id, faculty_id, batch_id, division_id, section_id, academic_year_id),

    CONSTRAINT fk_assignment_subject
        FOREIGN KEY (subject_id) REFERENCES subject(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_assignment_faculty
        FOREIGN KEY (faculty_id) REFERENCES faculty(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_assignment_batch
        FOREIGN KEY (batch_id) REFERENCES batch(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_assignment_division
        FOREIGN KEY (division_id) REFERENCES division(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_assignment_section
        FOREIGN KEY (section_id) REFERENCES section(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_assignment_academic_year
        FOREIGN KEY (academic_year_id) REFERENCES academic_year(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_assignment_semester
        FOREIGN KEY (semester_id) REFERENCES semester(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    INDEX idx_assignment_faculty (faculty_id),
    INDEX idx_assignment_batch (batch_id),
    INDEX idx_assignment_section (section_id)
) ENGINE=InnoDB;

DELIMITER $$
CREATE TRIGGER trg_assignment_hierarchy_before_insert
BEFORE INSERT ON teaching_assignment
FOR EACH ROW
BEGIN
    DECLARE v_division_batch_id BIGINT UNSIGNED;
    DECLARE v_division_semester_id TINYINT UNSIGNED;
    DECLARE v_section_division_id BIGINT UNSIGNED;

    IF NEW.division_id IS NOT NULL THEN
        SELECT batch_id, semester_id INTO v_division_batch_id, v_division_semester_id
            FROM division WHERE id = NEW.division_id;
        IF v_division_batch_id IS NULL OR v_division_batch_id <> NEW.batch_id
           OR v_division_semester_id <> NEW.semester_id THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'teaching_assignment.division_id does not belong to this batch/semester';
        END IF;
    END IF;

    IF NEW.section_id IS NOT NULL THEN
        IF NEW.division_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'teaching_assignment.section_id requires division_id to be set';
        END IF;
        SELECT division_id INTO v_section_division_id FROM section WHERE id = NEW.section_id;
        IF v_section_division_id IS NULL OR v_section_division_id <> NEW.division_id THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'teaching_assignment.section_id does not belong to teaching_assignment.division_id';
        END IF;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_assignment_hierarchy_before_update
BEFORE UPDATE ON teaching_assignment
FOR EACH ROW
BEGIN
    DECLARE v_division_batch_id BIGINT UNSIGNED;
    DECLARE v_division_semester_id TINYINT UNSIGNED;
    DECLARE v_section_division_id BIGINT UNSIGNED;

    IF NEW.division_id IS NOT NULL THEN
        SELECT batch_id, semester_id INTO v_division_batch_id, v_division_semester_id
            FROM division WHERE id = NEW.division_id;
        IF v_division_batch_id IS NULL OR v_division_batch_id <> NEW.batch_id
           OR v_division_semester_id <> NEW.semester_id THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'teaching_assignment.division_id does not belong to this batch/semester';
        END IF;
    END IF;

    IF NEW.section_id IS NOT NULL THEN
        IF NEW.division_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'teaching_assignment.section_id requires division_id to be set';
        END IF;
        SELECT division_id INTO v_section_division_id FROM section WHERE id = NEW.section_id;
        IF v_section_division_id IS NULL OR v_section_division_id <> NEW.division_id THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'teaching_assignment.section_id does not belong to teaching_assignment.division_id';
        END IF;
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- 7. FEEDBACK — categories power the Analytics screens
-- ============================================================

CREATE TABLE feedback_question_category (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    display_order TINYINT UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE feedback_form (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    form_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    teaching_assignment_id BIGINT UNSIGNED NOT NULL,
    window_start_date DATE NULL,
    window_end_date DATE NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at DATETIME NULL,
    status ENUM('DRAFT','PUBLISHED','UNPUBLISHED','CLOSED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    created_by_user_account_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_form_teaching_assignment
        FOREIGN KEY (teaching_assignment_id) REFERENCES teaching_assignment(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_form_created_by
        FOREIGN KEY (created_by_user_account_id) REFERENCES user_account(id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_form_teaching_assignment (teaching_assignment_id),
    INDEX idx_form_status (status)
) ENGINE=InnoDB;

CREATE TABLE feedback_question (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    feedback_form_id BIGINT UNSIGNED NOT NULL,
    category_id TINYINT UNSIGNED NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('RATING','YES_NO','TEXT','SINGLE_CHOICE','MULTIPLE_CHOICE')
        NOT NULL DEFAULT 'RATING',
    display_order TINYINT UNSIGNED NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    max_rating TINYINT UNSIGNED NOT NULL DEFAULT 5,

    CONSTRAINT fk_question_form
        FOREIGN KEY (feedback_form_id) REFERENCES feedback_form(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_question_category
        FOREIGN KEY (category_id) REFERENCES feedback_question_category(id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_question_form (feedback_form_id)
) ENGINE=InnoDB;

CREATE TABLE feedback_question_option (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT UNSIGNED NOT NULL,
    option_value VARCHAR(100) NOT NULL,
    option_label VARCHAR(200) NOT NULL,
    display_order TINYINT UNSIGNED NOT NULL DEFAULT 1,

    UNIQUE KEY uk_question_option (question_id, option_value),
    CONSTRAINT fk_option_question
        FOREIGN KEY (question_id) REFERENCES feedback_question(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE feedback_response (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    feedback_form_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    overall_remark TEXT NULL,
    is_excluded BOOLEAN NOT NULL DEFAULT FALSE,
    excluded_by_user_account_id BIGINT UNSIGNED NULL,
    excluded_reason VARCHAR(255) NULL,
    excluded_at DATETIME NULL,
    submitted_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_response_form_student (feedback_form_id, student_id),

    CONSTRAINT fk_response_form
        FOREIGN KEY (feedback_form_id) REFERENCES feedback_form(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_response_student
        FOREIGN KEY (student_id) REFERENCES student(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_response_excluded_by
        FOREIGN KEY (excluded_by_user_account_id) REFERENCES user_account(id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_response_student (student_id),
    INDEX idx_response_form (feedback_form_id)
) ENGINE=InnoDB;

CREATE TABLE feedback_answer (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    response_id BIGINT UNSIGNED NOT NULL,
    question_id BIGINT UNSIGNED NOT NULL,
    rating_value DECIMAL(3,1) NULL,
    text_value TEXT NULL,
    selected_option_id BIGINT UNSIGNED NULL,

    UNIQUE KEY uk_response_question (response_id, question_id),
    CONSTRAINT fk_answer_response
        FOREIGN KEY (response_id) REFERENCES feedback_response(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_answer_question
        FOREIGN KEY (question_id) REFERENCES feedback_question(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_answer_option
        FOREIGN KEY (selected_option_id) REFERENCES feedback_question_option(id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_answer_question (question_id)
) ENGINE=InnoDB;

-- ============================================================
-- 8. REPORTS, IMPORTS, SETTINGS
-- ============================================================

CREATE TABLE report (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(250) NOT NULL,
    department_id BIGINT UNSIGNED NULL,
    academic_year_id BIGINT UNSIGNED NOT NULL,
    term ENUM('ODD','EVEN') NULL,
    sample_size INT UNSIGNED NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    pdf_file_path VARCHAR(500) NULL,
    generated_by_user_account_id BIGINT UNSIGNED NULL,
    generated_at DATETIME NOT NULL,
    status ENUM('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT fk_report_department
        FOREIGN KEY (department_id) REFERENCES department(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_report_academic_year
        FOREIGN KEY (academic_year_id) REFERENCES academic_year(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_report_generated_by
        FOREIGN KEY (generated_by_user_account_id) REFERENCES user_account(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE data_import_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    import_type ENUM('STUDENT_ROSTER','FACULTY_SESSION_MAPPING','HISTORIC_FEEDBACK_METRICS','OTHER')
        NOT NULL DEFAULT 'OTHER',
    department_id BIGINT UNSIGNED NULL,
    uploaded_by_user_account_id BIGINT UNSIGNED NULL,
    record_count INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('SUCCESS','FAILED','PROCESSING') NOT NULL DEFAULT 'PROCESSING',
    error_log TEXT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_import_department
        FOREIGN KEY (department_id) REFERENCES department(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_import_uploaded_by
        FOREIGN KEY (uploaded_by_user_account_id) REFERENCES user_account(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE system_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT UNSIGNED NULL,
    rating_scale_min TINYINT UNSIGNED NOT NULL DEFAULT 1,
    rating_scale_max TINYINT UNSIGNED NOT NULL DEFAULT 5,
    min_responses_threshold INT UNSIGNED NOT NULL DEFAULT 10,
    window_start_date DATE NULL,
    window_end_date DATE NULL,
    enforce_anonymous_submissions BOOLEAN NOT NULL DEFAULT TRUE,
    auto_publish_on_window_close BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by_user_account_id BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_settings_department (department_id),
    CONSTRAINT fk_settings_department
        FOREIGN KEY (department_id) REFERENCES department(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_settings_updated_by
        FOREIGN KEY (updated_by_user_account_id) REFERENCES user_account(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 9. SEED DATA (matches what's on your screens, for validation)
-- ============================================================

INSERT INTO semester (id, semester_no, term) VALUES
(1,1,'ODD'),(2,2,'EVEN'),(3,3,'ODD'),(4,4,'EVEN'),
(5,5,'ODD'),(6,6,'EVEN'),(7,7,'ODD'),(8,8,'EVEN');

INSERT INTO designation (designation_name) VALUES
('Professor'), ('Associate Professor'), ('Assistant Professor'), ('Head of Department (HOD)');

INSERT INTO department (department_code, department_name) VALUES
('CE','Computer Engineering'),
('IT','Information Technology'),
('CSE','Computer Science & Engineering'),
('ECE','Electronics & Communication'),
('ME','Mechanical Engineering');

INSERT INTO feedback_question_category (category_name, display_order) VALUES
('Punctuality & Discipline',1),
('Subject Knowledge & Depth',2),
('Clarity of Teaching',3),
('Study Material / Practical Guidance',4);

INSERT INTO system_settings (department_id, min_responses_threshold, window_start_date, window_end_date)
VALUES (NULL, 10, '2026-08-01', '2026-08-31');

-- ============================================================
-- 10. VIEWS
-- ============================================================

CREATE OR REPLACE VIEW vw_feedback_form_rating_summary AS
SELECT
    ff.id AS feedback_form_id,
    ff.form_code,
    ta.subject_id,
    ta.faculty_id,
    COUNT(DISTINCT fr.id) AS total_submissions,
    COUNT(DISTINCT CASE WHEN fr.is_excluded = FALSE THEN fr.id END) AS included_submissions,
    COUNT(DISTINCT CASE WHEN fr.is_excluded = TRUE THEN fr.id END) AS excluded_submissions,
    ROUND(AVG(CASE WHEN fr.is_excluded = FALSE THEN fa.rating_value END), 2) AS average_rating
FROM feedback_form ff
JOIN teaching_assignment ta ON ta.id = ff.teaching_assignment_id
LEFT JOIN feedback_response fr ON fr.feedback_form_id = ff.id
LEFT JOIN feedback_answer fa ON fa.response_id = fr.id
GROUP BY ff.id, ff.form_code, ta.subject_id, ta.faculty_id;

CREATE OR REPLACE VIEW vw_subject_category_scores AS
SELECT
    sub.id AS subject_id,
    sub.subject_code,
    fqc.category_name,
    ROUND(AVG(fa.rating_value), 2) AS average_rating
FROM feedback_answer fa
JOIN feedback_question fq ON fq.id = fa.question_id
JOIN feedback_question_category fqc ON fqc.id = fq.category_id
JOIN feedback_response fr ON fr.id = fa.response_id AND fr.is_excluded = FALSE
JOIN feedback_form ff ON ff.id = fr.feedback_form_id
JOIN teaching_assignment ta ON ta.id = ff.teaching_assignment_id
JOIN subject sub ON sub.id = ta.subject_id
GROUP BY sub.id, sub.subject_code, fqc.category_name;

CREATE OR REPLACE VIEW vw_faculty_rating_summary AS
SELECT
    fac.id AS faculty_id,
    fac.full_name,
    dep.department_name,
    COUNT(DISTINCT fr.id) AS total_responses,
    ROUND(AVG(fa.rating_value), 2) AS average_rating
FROM faculty fac
JOIN department dep ON dep.id = fac.department_id
JOIN teaching_assignment ta ON ta.faculty_id = fac.id
JOIN feedback_form ff ON ff.teaching_assignment_id = ta.id
JOIN feedback_response fr ON fr.feedback_form_id = ff.id AND fr.is_excluded = FALSE
JOIN feedback_answer fa ON fa.response_id = fr.id
GROUP BY fac.id, fac.full_name, dep.department_name;

CREATE OR REPLACE VIEW vw_division_student_counts AS
SELECT
    d.id AS division_id,
    d.department_id,
    d.batch_id,
    d.semester_id,
    d.division_code,
    COUNT(s.id) AS student_count
FROM division d
LEFT JOIN student s ON s.division_id = d.id AND s.status = 'ACTIVE'
GROUP BY d.id, d.department_id, d.batch_id, d.semester_id, d.division_code;

CREATE OR REPLACE VIEW vw_department_summary AS
SELECT
    dep.id AS department_id,
    dep.department_code,
    dep.department_name,
    hodf.full_name AS hod_name,
    (SELECT COUNT(*) FROM student s WHERE s.department_id = dep.id AND s.status = 'ACTIVE') AS student_count,
    (SELECT COUNT(*) FROM faculty f WHERE f.department_id = dep.id AND f.status = 'ACTIVE') AS faculty_count,
    (SELECT ROUND(AVG(vfrs.average_rating), 2)
       FROM vw_faculty_rating_summary vfrs
       JOIN faculty f2 ON f2.id = vfrs.faculty_id
      WHERE f2.department_id = dep.id) AS avg_rating
FROM department dep
LEFT JOIN faculty hodf ON hodf.id = dep.hod_faculty_id;

SET FOREIGN_KEY_CHECKS = 1;
