DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_or_reactivate_area`(
    IN p_district_id INT,
    IN p_name VARCHAR(100),
    IN p_pincode VARCHAR(10)
)
BEGIN
    DECLARE v_existing_id INT DEFAULT NULL;
    DECLARE v_is_deleted TINYINT DEFAULT NULL;
    DECLARE v_clean_name VARCHAR(100);
    DECLARE v_clean_pincode VARCHAR(10);

    SET v_clean_name = TRIM(p_name);
    SET v_clean_pincode = NULLIF(TRIM(p_pincode), '');

    IF p_district_id IS NULL OR v_clean_name IS NULL OR v_clean_name = '' THEN
        SELECT 400 AS status, 'District ID and Area Name are required.' AS message, NULL AS id;
    ELSE
        -- Check if area name exists in this district
        SELECT id, is_deleted
        INTO v_existing_id, v_is_deleted
        FROM areas
        WHERE district_id = p_district_id
          AND LOWER(name) = LOWER(v_clean_name)
        LIMIT 1;

        -- Conflict: Already active
        IF v_existing_id IS NOT NULL AND v_is_deleted = 0 THEN
            SELECT 409 AS status, 'Area already exists in this district.' AS message, v_existing_id AS id;

        -- Reactivate if soft-deleted
        ELSEIF v_existing_id IS NOT NULL AND v_is_deleted = 1 THEN
            UPDATE areas
            SET is_deleted = 0,
                name = v_clean_name,
                pincode = v_clean_pincode
            WHERE id = v_existing_id;

            SELECT 200 AS status, 'Area reactivated successfully.' AS message, v_existing_id AS id;

            SELECT id, district_id, name, pincode, is_deleted, created_at
            FROM areas
            WHERE id = v_existing_id;

        -- Insert new
        ELSE
            INSERT INTO areas (district_id, name, pincode, is_deleted)
            VALUES (p_district_id, v_clean_name, v_clean_pincode, 0);

            SET v_existing_id = LAST_INSERT_ID();

            SELECT 201 AS status, 'Area created successfully.' AS message, v_existing_id AS id;

            SELECT id, district_id, name, pincode, is_deleted, created_at
            FROM areas
            WHERE id = v_existing_id;
        END IF;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_booking`(
    IN p_id INT
)
BEGIN
    DECLARE v_affected_rows INT DEFAULT 0;

    -- Perform soft delete
    UPDATE bookings
    SET 
        is_deleted = 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id AND is_deleted = 0;

    SET v_affected_rows = ROW_COUNT();

    -- Return status of deletion
    SELECT 
        p_id AS id,
        v_affected_rows AS affected_rows,
        CASE WHEN v_affected_rows > 0 THEN 1 ELSE 0 END AS success;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_areas_by_district`(
    IN p_district_id INT,
    IN p_search VARCHAR(100)
)
BEGIN
    SELECT 
        a.id,
        a.district_id,
        a.name,
        a.pincode,
        a.is_deleted,
        a.created_at,
        d.name AS district_name,
        d.state_id,
        s.name AS state_name
    FROM areas a
    JOIN districts d ON a.district_id = d.id
    JOIN states s ON d.state_id = s.id
    WHERE a.district_id = p_district_id
      AND a.is_deleted = 0
      AND (
          p_search IS NULL 
          OR TRIM(p_search) = '' 
          OR a.name LIKE CONCAT('%', TRIM(p_search), '%')     -- Area name search
          OR a.pincode LIKE CONCAT('%', TRIM(p_search), '%')  -- Pincode search
      )
    ORDER BY a.name ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_area_hierarchy`(
    IN p_district_id INT
)
BEGIN
    DECLARE v_target_district_id INT DEFAULT p_district_id;

    -- Pick first district if none specified
    IF v_target_district_id IS NULL OR v_target_district_id <= 0 THEN
        SELECT id INTO v_target_district_id
        FROM districts
        ORDER BY name ASC
        LIMIT 1;
    END IF;

    -- Result Set 1: States
    SELECT id, name, code, created_at
    FROM states
    ORDER BY name ASC;

    -- Result Set 2: Districts with active area count
    SELECT 
        d.id,
        d.state_id,
        d.name,
        d.code,
        d.created_at,
        COUNT(CASE WHEN a.is_deleted = 0 THEN 1 END) AS area_count
    FROM districts d
    LEFT JOIN areas a ON a.district_id = d.id
    GROUP BY d.id, d.state_id, d.name, d.code, d.created_at
    ORDER BY d.name ASC;

    -- Result Set 3: Selected District ID
    SELECT v_target_district_id AS selected_district_id;

    -- Result Set 4: Active Areas of target district
    SELECT 
        a.id,
        a.district_id,
        a.name,
        a.pincode,
        a.is_deleted,
        a.created_at
    FROM areas a
    WHERE a.district_id = v_target_district_id
      AND a.is_deleted = 0
    ORDER BY a.name ASC;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_bookings_paginated`(
    IN p_page        INT,
    IN p_limit       INT,
    IN p_role_id     INT,
    IN p_login_id    INT,
    IN p_district_id INT
)
BEGIN
    DECLARE v_limit INT DEFAULT 15;
    DECLARE v_page INT DEFAULT 1;
    DECLARE v_offset INT DEFAULT 0;
    DECLARE v_district_id INT DEFAULT NULL;

    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_page = p_page;
    END IF;

    SET v_offset = (v_page - 1) * v_limit;
    SET v_district_id = p_district_id;

    IF p_role_id = 3 AND (v_district_id IS NULL OR v_district_id <= 0) AND p_login_id IS NOT NULL THEN
        SELECT district_id INTO v_district_id
        FROM users
        WHERE id = p_login_id AND is_deleted = 0
        LIMIT 1;
    END IF;

    SELECT 
        id,
        name,
        mobile,
        address,
        notes,
        status,
        login_role_id,
        login_id,
        login_name,
        state_id,
        state_name,
        district_id,
        district_name,
        area_id,
        area_name,
        branch_head_id,
        branch_head_name,
        documents,
        created_at,
        updated_at
    FROM bookings
    WHERE is_deleted = 0
      AND (
          (p_role_id IN (1, 2) OR p_role_id IS NULL)
          OR (p_role_id = 3 AND district_id = v_district_id)
          OR (p_role_id NOT IN (1, 2, 3) AND login_id = p_login_id)
      )
    ORDER BY created_at DESC
    LIMIT v_limit OFFSET v_offset;

    SELECT 
        COUNT(*) AS total_records,
        v_page AS current_page,
        v_limit AS page_size,
        CEIL(COUNT(*) / v_limit) AS total_pages
    FROM bookings
    WHERE is_deleted = 0
      AND (
          (p_role_id IN (1, 2) OR p_role_id IS NULL)
          OR (p_role_id = 3 AND district_id = v_district_id)
          OR (p_role_id NOT IN (1, 2, 3) AND login_id = p_login_id)
      );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `mobile_login`(
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT DEFAULT NULL;

    SELECT id INTO v_user_id
    FROM users
    WHERE username = p_username 
      AND password = p_password 
      AND role_id IN (2, 3)
      AND is_active = 1
      AND is_deleted = 0
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = v_user_id;

        SELECT 
            u.id,
            u.username,
            u.role_id       AS roleId,
            u.role,
            u.user_type_id  AS userTypeId,
            u.user_type     AS userType,
            u.name,
            u.email,
            u.phone,
            u.state_id      AS stateId,
            s.name          AS stateName,
            -- District only for branch_head (role 3)
            CASE WHEN u.role_id = 3 THEN u.district_id ELSE NULL END AS districtId,
            CASE WHEN u.role_id = 3 THEN d.name ELSE NULL END        AS districtName,
            CASE WHEN u.role_id = 3 THEN d.code ELSE NULL END        AS districtCode,
            u.address,
            u.is_active     AS isActive,
            u.last_login_at AS lastLoginAt,
            u.created_at    AS createdAt
        FROM users u
        LEFT JOIN states s ON u.state_id = s.id
        LEFT JOIN districts d ON u.district_id = d.id
        WHERE u.id = v_user_id;
    ELSE
        SELECT NULL AS id WHERE 1 = 0;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `save_booking`(
    IN p_id               INT,            -- Pass NULL or 0 for INSERT; Pass booking ID for UPDATE
    IN p_name             VARCHAR(150),
    IN p_mobile           VARCHAR(25),
    IN p_address          TEXT,
    IN p_notes            TEXT,
    IN p_status           VARCHAR(50),
    IN p_login_role_id    INT,
    IN p_login_id         INT,
    IN p_login_name       VARCHAR(150),
    IN p_state_id         INT,
    IN p_state_name       VARCHAR(100),
    IN p_district_id      INT,
    IN p_district_name    VARCHAR(100),
    IN p_area_id          INT,
    IN p_area_name        VARCHAR(100),
    IN p_branch_head_id   INT,
    IN p_branch_head_name VARCHAR(150),
    IN p_documents        JSON
)
BEGIN
    DECLARE v_booking_id INT;
    DECLARE v_status VARCHAR(50) DEFAULT 'NEW';
    DECLARE v_state_name VARCHAR(100);
    DECLARE v_district_name VARCHAR(100);
    DECLARE v_area_name VARCHAR(100);
    DECLARE v_branch_head_id INT;
    DECLARE v_branch_head_name VARCHAR(150);

    -- 1. Trim and initialize string variables
    SET v_state_name = TRIM(p_state_name);
    SET v_district_name = TRIM(p_district_name);
    SET v_area_name = TRIM(p_area_name);
    SET v_branch_head_id = p_branch_head_id;
    SET v_branch_head_name = TRIM(p_branch_head_name);

    -- 2. Auto-resolve state_name if null/empty but state_id is provided
    IF (v_state_name IS NULL OR v_state_name = '') AND p_state_id IS NOT NULL THEN
        SELECT name INTO v_state_name FROM states WHERE id = p_state_id LIMIT 1;
    END IF;

    -- 3. Auto-resolve district_name if null/empty but district_id is provided
    IF (v_district_name IS NULL OR v_district_name = '') AND p_district_id IS NOT NULL THEN
        SELECT name INTO v_district_name FROM districts WHERE id = p_district_id LIMIT 1;
    END IF;

    -- 4. Auto-resolve area_name if null/empty but area_id is provided
    IF (v_area_name IS NULL OR v_area_name = '') AND p_area_id IS NOT NULL THEN
        SELECT name INTO v_area_name FROM areas WHERE id = p_area_id LIMIT 1;
    END IF;

    -- 5. Auto-resolve Branch Head:
    -- A) If branch_head_id is provided without name, fetch name from users table
    IF (v_branch_head_name IS NULL OR v_branch_head_name = '') AND v_branch_head_id IS NOT NULL THEN
        SELECT name INTO v_branch_head_name 
        FROM users 
        WHERE id = v_branch_head_id AND role_id = 3 AND is_deleted = 0 
        LIMIT 1;
    -- B) If branch_head_id is not provided, auto-assign from district_id
    ELSEIF (v_branch_head_id IS NULL OR v_branch_head_id <= 0) AND p_district_id IS NOT NULL THEN
        SELECT id, name INTO v_branch_head_id, v_branch_head_name
        FROM users
        WHERE role_id = 3 AND district_id = p_district_id AND is_deleted = 0
        LIMIT 1;
    END IF;

    -- =========================================================================
    -- MODE 1: CREATE (When p_id is NULL or <= 0)
    -- =========================================================================
    IF p_id IS NULL OR p_id <= 0 THEN
        IF p_status IS NOT NULL AND TRIM(p_status) != '' THEN
            SET v_status = UPPER(TRIM(p_status));
        END IF;

        INSERT INTO bookings (
            name, mobile, address, notes, status,
            login_role_id, login_id, login_name,
            state_id, state_name, district_id, district_name,
            area_id, area_name, branch_head_id, branch_head_name,
            documents
        ) VALUES (
            p_name, p_mobile, p_address, p_notes, v_status,
            p_login_role_id, p_login_id, p_login_name,
            p_state_id, v_state_name, p_district_id, v_district_name,
            p_area_id, v_area_name, v_branch_head_id, v_branch_head_name,
            p_documents
        );

        SET v_booking_id = LAST_INSERT_ID();

    -- =========================================================================
    -- MODE 2: UPDATE (When p_id > 0)
    -- =========================================================================
    ELSE
        UPDATE bookings
        SET 
            name             = COALESCE(p_name, name),
            mobile           = COALESCE(p_mobile, mobile),
            address          = COALESCE(p_address, address),
            notes            = COALESCE(p_notes, notes),
            status           = COALESCE(UPPER(TRIM(p_status)), status),
            login_role_id    = COALESCE(p_login_role_id, login_role_id),
            login_id         = COALESCE(p_login_id, login_id),
            login_name       = COALESCE(p_login_name, login_name),
            state_id         = COALESCE(p_state_id, state_id),
            state_name       = COALESCE(v_state_name, state_name),
            district_id      = COALESCE(p_district_id, district_id),
            district_name    = COALESCE(v_district_name, district_name),
            area_id          = COALESCE(p_area_id, area_id),
            area_name        = COALESCE(v_area_name, area_name),
            branch_head_id   = COALESCE(v_branch_head_id, branch_head_id),
            branch_head_name = COALESCE(v_branch_head_name, branch_head_name),
            documents        = COALESCE(p_documents, documents),
            updated_at       = CURRENT_TIMESTAMP
        WHERE id = p_id AND is_deleted = 0;

        SET v_booking_id = p_id;
    END IF;

    -- =========================================================================
    -- RETURN THE SAVED / UPDATED RECORD
    -- =========================================================================
    SELECT 
        id, name, mobile, address, notes, status,
        login_role_id, login_id, login_name,
        state_id, state_name, district_id, district_name,
        area_id, area_name, branch_head_id, branch_head_name,
        documents, is_deleted, created_at, updated_at
    FROM bookings
    WHERE id = v_booking_id AND is_deleted = 0;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `set_booking_branch_head`(
    IN p_booking_id       INT,
    IN p_branch_head_id   INT,
    IN p_branch_head_name VARCHAR(150)
)
BEGIN
    DECLARE v_branch_head_name VARCHAR(150);

    -- 1. Validate booking_id
    IF p_booking_id IS NULL OR p_booking_id <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'booking_id is required.';
    END IF;

    SET v_branch_head_name = TRIM(p_branch_head_name);

    -- 2. If branch_head_name is omitted or blank, auto-resolve from users table (role_id = 3: branch_head)
    IF (v_branch_head_name IS NULL OR v_branch_head_name = '') AND p_branch_head_id IS NOT NULL THEN
        SELECT name INTO v_branch_head_name 
        FROM users 
        WHERE id = p_branch_head_id AND role_id = 3 AND is_deleted = 0 
        LIMIT 1;
    END IF;

    -- 3. Update the booking with the branch head details
    UPDATE bookings
    SET 
        branch_head_id   = p_branch_head_id,
        branch_head_name = v_branch_head_name,
        updated_at       = CURRENT_TIMESTAMP
    WHERE id = p_booking_id AND is_deleted = 0;

    -- 4. Return the updated booking record
    SELECT 
        id, name, mobile, address, notes, status,
        login_role_id, login_id, login_name,
        state_id, state_name, district_id, district_name,
        area_id, area_name, branch_head_id, branch_head_name,
        documents, is_deleted, created_at, updated_at
    FROM bookings
    WHERE id = p_booking_id AND is_deleted = 0;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `soft_delete_area`(
    IN p_area_id INT
)
BEGIN
    DECLARE v_affected_rows INT DEFAULT 0;

    UPDATE areas
    SET is_deleted = 1
    WHERE id = p_area_id AND is_deleted = 0;

    SET v_affected_rows = ROW_COUNT();

    IF v_affected_rows > 0 THEN
        SELECT 200 AS status, 'Area deleted successfully.' AS message;
    ELSE
        SELECT 404 AS status, 'Area not found or already deleted.' AS message;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_branch_heads_dropdown`(
    IN p_district_id INT,           -- Optional: Filter by specific district (NULL = all branch heads)
    IN p_search      VARCHAR(100),  -- Optional: Search keyword (matches name, phone, or district)
    IN p_page        INT,           -- Page number (default: 1)
    IN p_limit       INT            -- Items per page (default: 50)
)
BEGIN
    DECLARE v_limit INT DEFAULT 50;
    DECLARE v_page INT DEFAULT 1;
    DECLARE v_offset INT DEFAULT 0;
    DECLARE v_search VARCHAR(105) DEFAULT NULL;

    -- 1. Apply defaults for page and limit
    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_page = p_page;
    END IF;

    SET v_offset = (v_page - 1) * v_limit;

    -- 2. Normalize search
    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search = TRIM(p_search);
    END IF;

    -- 3. Return active Branch Heads (role_id = 3)
    SELECT 
        u.id,
        u.name,
        u.district_id,
        TRIM(REPLACE(d.name, ' Hub', '')) AS district_name,
        u.phone,
        u.email
    FROM users u
    LEFT JOIN districts d ON u.district_id = d.id
    WHERE u.role_id = 3
      AND u.is_active = 1
      AND u.is_deleted = 0
      -- District filter (if provided)
      AND (p_district_id IS NULL OR u.district_id = p_district_id)
      -- Search filter
      AND (
          v_search IS NULL 
          OR u.name LIKE CONCAT('%', v_search, '%') 
          OR d.name LIKE CONCAT('%', v_search, '%')
          OR u.phone LIKE CONCAT('%', v_search, '%')
      )
    ORDER BY u.name ASC
    LIMIT v_limit OFFSET v_offset;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_client_status_history`(
    IN p_client_id INT
)
BEGIN
    SELECT 
        id,
        client_id,
        client_name,
        status,
        schedule_date,
        notes,
        created_by_name,
        created_at
    FROM client_status_logs
    WHERE client_id = p_client_id
    ORDER BY created_at DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_coordinator_bookings`(
    IN p_status       VARCHAR(50),
    IN p_district_id  INT,
    IN p_search       VARCHAR(100),
    IN p_page         INT,
    IN p_limit        INT
)
BEGIN
    DECLARE v_limit INT DEFAULT 15;
    DECLARE v_page INT DEFAULT 1;
    DECLARE v_offset INT DEFAULT 0;
    DECLARE v_search VARCHAR(105) DEFAULT NULL;
    DECLARE v_status VARCHAR(50) DEFAULT NULL;

    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_page = p_page;
    END IF;

    SET v_offset = (v_page - 1) * v_limit;

    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search = TRIM(p_search);
    END IF;

    IF p_status IS NOT NULL AND TRIM(p_status) != '' THEN
        SET v_status = UPPER(TRIM(p_status));
    END IF;

    SELECT 
        b.id,
        b.name,
        b.mobile,
        b.address,
        b.notes,
        b.status,
        b.schedule_date,
        b.created_by,
        b.created_by_name,
        b.login_role_id,
        b.login_id,
        b.login_name,
        b.state_id,
        b.state_name,
        b.district_id,
        b.district_name,
        b.area_id,
        b.area_name,
        b.branch_head_id,
        b.branch_head_name,
        b.documents,
        b.created_at,
        b.updated_at
    FROM bookings b
    WHERE b.is_deleted = 0
      AND (
          v_status IS NULL 
          OR v_status = 'ALL' 
          OR b.status = v_status
          OR (v_status = 'UNREAD' AND b.status = 'NEW')
          OR (v_status = 'PENDING' AND b.status = 'SCHEDULED')
      )
      AND (p_district_id IS NULL OR b.district_id = p_district_id)
      AND (
          v_search IS NULL
          OR b.name LIKE CONCAT('%', v_search, '%')
          OR b.mobile LIKE CONCAT('%', v_search, '%')
          OR b.address LIKE CONCAT('%', v_search, '%')
          OR b.area_name LIKE CONCAT('%', v_search, '%')
          OR b.district_name LIKE CONCAT('%', v_search, '%')
          OR b.branch_head_name LIKE CONCAT('%', v_search, '%')
          OR b.created_by_name LIKE CONCAT('%', v_search, '%')
      )
    ORDER BY b.created_at DESC
    LIMIT v_limit OFFSET v_offset;

    SELECT 
        COUNT(*) AS total_records,
        v_page AS current_page,
        v_limit AS page_size,
        CEIL(COUNT(*) / v_limit) AS total_pages
    FROM bookings b
    WHERE b.is_deleted = 0
      AND (
          v_status IS NULL 
          OR v_status = 'ALL' 
          OR b.status = v_status
          OR (v_status = 'UNREAD' AND b.status = 'NEW')
          OR (v_status = 'PENDING' AND b.status = 'SCHEDULED')
      )
      AND (p_district_id IS NULL OR b.district_id = p_district_id)
      AND (
          v_search IS NULL
          OR b.name LIKE CONCAT('%', v_search, '%')
          OR b.mobile LIKE CONCAT('%', v_search, '%')
          OR b.address LIKE CONCAT('%', v_search, '%')
          OR b.area_name LIKE CONCAT('%', v_search, '%')
          OR b.district_name LIKE CONCAT('%', v_search, '%')
          OR b.branch_head_name LIKE CONCAT('%', v_search, '%')
          OR b.created_by_name LIKE CONCAT('%', v_search, '%')
      );

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_dropdown_data`(
    IN p_type       VARCHAR(20),   -- 'district' OR 'area'
    IN p_parent_id  INT,           -- state_id (for district) OR district_id (for area)
    IN p_search     VARCHAR(100),  -- Search keyword, NULL or empty for no filter
    IN p_role_id    INT,           -- Logged in user role_id (3 = branch_head)
    IN p_login_id   INT,           -- Logged in user id (optional fallback lookup)
    IN p_page       INT,           -- Page number (default: 1)
    IN p_limit      INT            -- Items per page (default: 20)
)
BEGIN
    DECLARE v_search VARCHAR(105);
    DECLARE v_parent_id INT;
    DECLARE v_page INT DEFAULT 1;
    DECLARE v_limit INT DEFAULT 20;
    DECLARE v_offset INT DEFAULT 0;
    
    -- 1. Normalize search input
    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search = TRIM(p_search);
    ELSE
        SET v_search = NULL;
    END IF;

    SET v_parent_id = p_parent_id;

    -- 2. Handle Pagination & Calculate Offset
    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_page = p_page;
    END IF;

    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    -- Formula: offset = (page - 1) * limit
    SET v_offset = (v_page - 1) * v_limit;

    -- 3. Safety check: If Role 3 (Branch Head) and parent_id was not passed, resolve from users table
    IF p_role_id = 3 AND v_parent_id IS NULL AND p_login_id IS NOT NULL THEN
        SELECT district_id INTO v_parent_id 
        FROM users 
        WHERE id = p_login_id AND is_deleted = 0 
        LIMIT 1;
    END IF;

    -- ========================================================
    -- 1. DISTRICT DROPDOWN (Strips ' Hub' from the name)
    -- ========================================================
    IF LOWER(TRIM(p_type)) = 'district' THEN
        -- If Role 3 (Branch Head), only return their 1 assigned district without ' Hub'
        IF p_role_id = 3 THEN
            SELECT 
                d.id, 
                TRIM(REPLACE(d.name, ' Hub', '')) AS name
            FROM districts d
            WHERE d.id = v_parent_id
            LIMIT 1;
        ELSE
            SELECT 
                d.id, 
                TRIM(REPLACE(d.name, ' Hub', '')) AS name
            FROM districts d
            WHERE (v_parent_id IS NULL OR d.state_id = v_parent_id)
              AND (
                    v_search IS NULL 
                    OR d.name LIKE CONCAT('%', v_search, '%') 
                    OR d.code LIKE CONCAT('%', v_search, '%')
                  )
            ORDER BY name ASC
            LIMIT v_limit OFFSET v_offset;
        END IF;

    -- ========================================================
    -- 2. AREA DROPDOWN
    -- ========================================================
    ELSEIF LOWER(TRIM(p_type)) = 'area' THEN
        -- If Role 3 (Branch Head): STRICTLY fetch areas for their specific district_id
        IF p_role_id = 3 THEN
            IF v_parent_id IS NULL THEN
                SELECT NULL AS id, NULL AS name WHERE 1 = 0;
            ELSE
                SELECT 
                    a.id, 
                    a.name
                FROM areas a
                WHERE a.district_id = v_parent_id
                  AND (
                        v_search IS NULL 
                        OR a.name LIKE CONCAT('%', v_search, '%') 
                        OR a.pincode LIKE CONCAT('%', v_search, '%')
                      )
                ORDER BY a.name ASC
                LIMIT v_limit OFFSET v_offset;
            END IF;
        ELSE
            -- For other roles: filter by district if selected, with pagination
            SELECT 
                a.id, 
                a.name
            FROM areas a
            WHERE (v_parent_id IS NULL OR a.district_id = v_parent_id)
              AND (
                    v_search IS NULL 
                    OR a.name LIKE CONCAT('%', v_search, '%') 
                    OR a.pincode LIKE CONCAT('%', v_search, '%')
                  )
            ORDER BY a.name ASC
            LIMIT v_limit OFFSET v_offset;
        END IF;

    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid p_type. Allowed values are "district" or "area".';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_save_client_status`(
    IN p_client_id       INT,
    IN p_client_name     VARCHAR(150),
    IN p_status          VARCHAR(50),
    IN p_schedule_date   DATE,
    IN p_notes           TEXT,
    IN p_created_by      INT,
    IN p_created_by_name VARCHAR(100),
    IN p_branch_head_id  INT            -- <-- Pass selected Branch Head from dropdown
)
BEGIN
    DECLARE v_new_id INT;
    DECLARE v_clean_date DATE;
    DECLARE v_client_name VARCHAR(150);
    DECLARE v_created_by_name VARCHAR(100);
    DECLARE v_branch_head_name VARCHAR(150);

    -- 1. Auto-fetch client_name if omitted
    SET v_client_name = TRIM(p_client_name);
    IF v_client_name IS NULL OR v_client_name = '' THEN
        SELECT name INTO v_client_name FROM bookings WHERE id = p_client_id LIMIT 1;
    END IF;

    -- 2. Auto-fetch created_by_name (Who submitted the status update)
    SET v_created_by_name = TRIM(p_created_by_name);
    IF (v_created_by_name IS NULL OR v_created_by_name = '') AND p_created_by IS NOT NULL THEN
        SELECT name INTO v_created_by_name FROM users WHERE id = p_created_by LIMIT 1;
    END IF;

    -- 3. Auto-resolve Branch Head Name from users table
    IF p_branch_head_id IS NOT NULL AND p_branch_head_id > 0 THEN
        SELECT name INTO v_branch_head_name FROM users WHERE id = p_branch_head_id AND role_id = 3 LIMIT 1;
    END IF;

    -- 4. If status is Cancelled, clear schedule_date
    IF LOWER(TRIM(p_status)) = 'cancelled' THEN
        SET v_clean_date = NULL;
    ELSE
        SET v_clean_date = p_schedule_date;
    END IF;

    -- 5. Insert audit trail into client_status_logs
    INSERT INTO client_status_logs (
        client_id, client_name, status, schedule_date, notes, created_by, created_by_name
    ) VALUES (
        p_client_id, v_client_name, UPPER(TRIM(p_status)), v_clean_date, TRIM(p_notes), p_created_by, v_created_by_name
    );

    SET v_new_id = LAST_INSERT_ID();

    -- 6. Update BOTH Status AND Branch Head in bookings
    UPDATE bookings
    SET 
        status           = UPPER(TRIM(p_status)),
        schedule_date    = v_clean_date,
        notes            = CASE WHEN p_notes IS NOT NULL AND TRIM(p_notes) != '' THEN TRIM(p_notes) ELSE notes END,
        created_by       = p_created_by,
        created_by_name  = v_created_by_name,
        branch_head_id   = COALESCE(p_branch_head_id, branch_head_id),
        branch_head_name = COALESCE(v_branch_head_name, branch_head_name),
        updated_at       = CURRENT_TIMESTAMP
    WHERE id = p_client_id;

    -- 7. Return saved log
    SELECT id, client_id, client_name, status, schedule_date, notes, created_by, created_by_name, created_at
    FROM client_status_logs
    WHERE id = v_new_id;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_seed_ernakulam_areas`()
BEGIN
    -- Insert 17 additional authentic Ernakulam areas (skips if already added)
    INSERT INTO areas (district_id, name, pincode)
    SELECT * FROM (
        SELECT 1 AS district_id, 'Kadavanthra' AS name, '682020' AS pincode UNION ALL
        SELECT 1, 'Panampilly Nagar', '682036' UNION ALL
        SELECT 1, 'Marine Drive', '682031' UNION ALL
        SELECT 1, 'Ravipuram', '682016' UNION ALL
        SELECT 1, 'Thrikkakara', '682021' UNION ALL
        SELECT 1, 'Kalamassery', '683104' UNION ALL
        SELECT 1, 'Angamaly', '683572' UNION ALL
        SELECT 1, 'Perumbavoor', '683542' UNION ALL
        SELECT 1, 'Muvattupuzha', '686661' UNION ALL
        SELECT 1, 'Kothamangalam', '686691' UNION ALL
        SELECT 1, 'North Paravur', '683513' UNION ALL
        SELECT 1, 'Mattancherry', '682002' UNION ALL
        SELECT 1, 'Thevara', '682013' UNION ALL
        SELECT 1, 'Maradu', '682304' UNION ALL
        SELECT 1, 'Cherai', '683514' UNION ALL
        SELECT 1, 'Piravom', '686664' UNION ALL
        SELECT 1, 'Kolenchery', '682311'
    ) AS new_areas
    WHERE NOT EXISTS (
        SELECT 1 FROM areas WHERE district_id = 1 AND name = new_areas.name
    );

    -- Return all 25 areas for Ernakulam (district_id = 1)
    SELECT id, district_id, name, pincode, created_at
    FROM areas
    WHERE district_id = 1
    ORDER BY id ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_set_booking_branch_head`(
    IN p_booking_id       INT,
    IN p_branch_head_id   INT,
    IN p_branch_head_name VARCHAR(150)
)
BEGIN
    DECLARE v_branch_head_name VARCHAR(150);

    -- 1. Validate booking_id
    IF p_booking_id IS NULL OR p_booking_id <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'booking_id is required.';
    END IF;

    SET v_branch_head_name = TRIM(p_branch_head_name);

    -- 2. If branch_head_name is omitted or blank, auto-resolve from users table (role_id = 3: branch_head)
    IF (v_branch_head_name IS NULL OR v_branch_head_name = '') AND p_branch_head_id IS NOT NULL THEN
        SELECT name INTO v_branch_head_name 
        FROM users 
        WHERE id = p_branch_head_id AND role_id = 3 AND is_deleted = 0 
        LIMIT 1;
    END IF;

    -- 3. Update the booking with the branch head details
    UPDATE bookings
    SET 
        branch_head_id   = p_branch_head_id,
        branch_head_name = v_branch_head_name,
        updated_at       = CURRENT_TIMESTAMP
    WHERE id = p_booking_id AND is_deleted = 0;

    -- 4. Return the updated booking record
    SELECT 
        id, name, mobile, address, notes, status,
        login_role_id, login_id, login_name,
        state_id, state_name, district_id, district_name,
        area_id, area_name, branch_head_id, branch_head_name,
        documents, is_deleted, created_at, updated_at
    FROM bookings
    WHERE id = p_booking_id AND is_deleted = 0;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_coordinator_names`()
BEGIN
    -- =========================================================================
    -- 1. UPDATE `users` TABLE (Coordinators with role_id = 2)
    -- =========================================================================
    UPDATE users
    SET name = 'Elena Vance (Coordinator)'
    WHERE id = 2 OR username = 'admin';

    UPDATE users
    SET name = 'Alex George (Coordinator)'
    WHERE id = 3 OR username = 'coordinator';

    -- Replace any other "(Operations Coordinator)" or "(Field Coordinator)"
    UPDATE users
    SET name = REPLACE(REPLACE(name, '(Operations Coordinator)', '(Coordinator)'), '(Field Coordinator)', '(Coordinator)')
    WHERE role_id = 2;

    -- =========================================================================
    -- 2. UPDATE `bookings` TABLE (login_name & created_by_name)
    -- =========================================================================
    UPDATE bookings
    SET login_name = 'Elena Vance (Coordinator)'
    WHERE login_id = 2 OR login_name LIKE '%Elena Vance%';

    UPDATE bookings
    SET login_name = 'Alex George (Coordinator)'
    WHERE login_id = 3 OR login_name LIKE '%Alex George%';

    UPDATE bookings
    SET created_by_name = 'Elena Vance (Coordinator)'
    WHERE created_by = 2 OR created_by_name LIKE '%Elena Vance%';

    UPDATE bookings
    SET created_by_name = 'Alex George (Coordinator)'
    WHERE created_by = 3 OR created_by_name LIKE '%Alex George%';

    -- =========================================================================
    -- 3. UPDATE `client_status_logs` TABLE (created_by_name)
    -- =========================================================================
    UPDATE client_status_logs
    SET created_by_name = 'Elena Vance (Coordinator)'
    WHERE created_by = 2 OR created_by_name LIKE '%Elena Vance%';

    UPDATE client_status_logs
    SET created_by_name = 'Alex George (Coordinator)'
    WHERE created_by = 3 OR created_by_name LIKE '%Alex George%';

    -- =========================================================================
    -- 4. CONFIRM UPDATED COORDINATOR USERS
    -- =========================================================================
    SELECT id, username, name, role_id, role 
    FROM users 
    WHERE role_id = 2;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_area`(
    IN p_area_id INT,
    IN p_district_id INT,
    IN p_name VARCHAR(100),
    IN p_pincode VARCHAR(10)
)
BEGIN
    DECLARE v_current_district_id INT DEFAULT NULL;
    DECLARE v_duplicate_id INT DEFAULT NULL;
    DECLARE v_clean_name VARCHAR(100);
    DECLARE v_clean_pincode VARCHAR(10);
    DECLARE v_target_district_id INT;

    SET v_clean_name = TRIM(p_name);
    SET v_clean_pincode = NULLIF(TRIM(p_pincode), '');

    SELECT district_id INTO v_current_district_id
    FROM areas
    WHERE id = p_area_id
    LIMIT 1;

    IF v_current_district_id IS NULL THEN
        SELECT 404 AS status, 'Area not found.' AS message;
    ELSE
        SET v_target_district_id = COALESCE(p_district_id, v_current_district_id);

        -- Check duplicate in target district
        SELECT id INTO v_duplicate_id
        FROM areas
        WHERE district_id = v_target_district_id
          AND LOWER(name) = LOWER(v_clean_name)
          AND id != p_area_id
          AND is_deleted = 0
        LIMIT 1;

        IF v_duplicate_id IS NOT NULL THEN
            SELECT 409 AS status, 'Another area with this name already exists in this district.' AS message;
        ELSE
            UPDATE areas
            SET name = v_clean_name,
                pincode = v_clean_pincode,
                district_id = v_target_district_id
            WHERE id = p_area_id;

            SELECT 200 AS status, 'Area updated successfully.' AS message;

            SELECT id, district_id, name, pincode, is_deleted, created_at
            FROM areas
            WHERE id = p_area_id;
        END IF;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `web_login`(
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT DEFAULT NULL;
    DECLARE v_db_password VARCHAR(255) DEFAULT NULL;
    DECLARE v_role_id INT DEFAULT NULL;
    DECLARE v_is_active TINYINT DEFAULT NULL;
    DECLARE v_is_deleted TINYINT DEFAULT NULL;

    -- 1. Find user by username
    SELECT id, password, role_id, is_active, is_deleted
    INTO v_user_id, v_db_password, v_role_id, v_is_active, v_is_deleted
    FROM users
    WHERE username = p_username
    LIMIT 1;

    -- 2. Validate credentials
    IF v_user_id IS NULL OR v_is_deleted = 1 OR v_db_password != p_password THEN
        SELECT 401 AS status, 'Invalid login credentials.' AS message;

    ELSEIF v_is_active = 0 THEN
        SELECT 403 AS status, 'Your account is deactivated. Please contact administrator.' AS message;

    ELSEIF v_role_id NOT IN (1, 4) THEN
        SELECT 403 AS status, 'Access denied. You do not have permissions for web login.' AS message;

    ELSE
        -- 3. Success: Update last login timestamp
        UPDATE users 
        SET last_login_at = CURRENT_TIMESTAMP 
        WHERE id = v_user_id;

        -- Return 200 with full user data
        SELECT 
            200             AS status,
            'Login successful.' AS message,
            u.id,
            u.username,
            u.role_id       AS roleId,
            u.role,
            u.user_type_id  AS userTypeId,
            u.user_type     AS userType,
            u.name,
            u.email,
            u.phone,
            u.state_id      AS stateId,
            s.name          AS stateName,
            u.district_id   AS districtId,
            d.name          AS districtName,
            d.code          AS districtCode,
            u.address,
            u.is_active     AS isActive,
            u.last_login_at AS lastLoginAt,
            u.created_at    AS createdAt
        FROM users u
        LEFT JOIN states s ON u.state_id = s.id
        LEFT JOIN districts d ON u.district_id = d.id
        WHERE u.id = v_user_id;
    END IF;
END$$
DELIMITER ;
