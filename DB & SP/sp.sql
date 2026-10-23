DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_booking`(
    IN p_name           VARCHAR(150),
    IN p_mobile         VARCHAR(25),
    IN p_address        TEXT,
    IN p_notes          TEXT,
    IN p_status         VARCHAR(50),
    IN p_login_role_id  INT,
    IN p_login_id       INT,
    IN p_login_name     VARCHAR(150),
    IN p_state_id       INT,
    IN p_state_name     VARCHAR(100),
    IN p_district_id    INT,
    IN p_district_name  VARCHAR(100),
    IN p_area_id        INT,
    IN p_area_name      VARCHAR(100),
    IN p_documents      JSON
)
BEGIN
    DECLARE v_status VARCHAR(50) DEFAULT 'NEW';
    DECLARE v_new_id INT;
    DECLARE v_state_name VARCHAR(100);
    DECLARE v_district_name VARCHAR(100);

    -- Default status to 'NEW' if null or empty
    IF p_status IS NOT NULL AND TRIM(p_status) != '' THEN
        SET v_status = p_status;
    END IF;

    SET v_state_name = p_state_name;
    SET v_district_name = p_district_name;

    -- If state_name is missing, fetch from states table
    IF (v_state_name IS NULL OR TRIM(v_state_name) = '') AND p_state_id IS NOT NULL THEN
        SELECT name INTO v_state_name FROM states WHERE id = p_state_id LIMIT 1;
    END IF;

    -- If district_name is missing, fetch from districts table
    IF (v_district_name IS NULL OR TRIM(v_district_name) = '') AND p_district_id IS NOT NULL THEN
        SELECT name INTO v_district_name FROM districts WHERE id = p_district_id LIMIT 1;
    END IF;

    -- Insert directly with the resolved parameters
    INSERT INTO bookings (
        name, mobile, address, notes, status,
        login_role_id, login_id, login_name,
        state_id, state_name, district_id, district_name,
        area_id, area_name, documents
    ) VALUES (
        p_name, p_mobile, p_address, p_notes, v_status,
        p_login_role_id, p_login_id, p_login_name,
        p_state_id, v_state_name, p_district_id, v_district_name,
        p_area_id, p_area_name, p_documents
    );

    SET v_new_id = LAST_INSERT_ID();

    -- Return the newly created booking record
    SELECT 
        id, name, mobile, address, notes, status,
        login_role_id, login_id, login_name,
        state_id, state_name, district_id, district_name,
        area_id, area_name, documents,
        is_deleted, created_at, updated_at
    FROM bookings
    WHERE id = v_new_id;
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_bookings_paginated`(
    IN p_page  INT,  -- Page number (e.g. 1, 2, 3...)
    IN p_limit INT   -- Number of records per page (default is 15)
)
BEGIN
    DECLARE v_limit INT DEFAULT 15;
    DECLARE v_page INT DEFAULT 1;
    DECLARE v_offset INT DEFAULT 0;

    -- Apply default limit 15 if null or <= 0
    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    -- Apply default page 1 if null or <= 0
    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_page = p_page;
    END IF;

    SET v_offset = (v_page - 1) * v_limit;

    -- Query 1: Fetch paginated bookings (newest first, excluding soft-deleted)
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
        documents,
        created_at,
        updated_at
    FROM bookings
    WHERE is_deleted = 0
    ORDER BY created_at DESC
    LIMIT v_limit OFFSET v_offset;

    -- Query 2: Pagination metadata (total records, page number, total pages)
    SELECT 
        COUNT(*) AS total_records,
        v_page AS current_page,
        v_limit AS page_size,
        CEIL(COUNT(*) / v_limit) AS total_pages
    FROM bookings
    WHERE is_deleted = 0;
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
    IN p_created_by_name VARCHAR(100)
)
BEGIN
    DECLARE v_new_id INT;
    DECLARE v_clean_date DATE;

    -- 1. Validate mandatory fields
    IF p_client_id IS NULL OR p_client_id <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'client_id is required.';
    END IF;

    IF p_status IS NULL OR TRIM(p_status) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Status is required.';
    END IF;

    -- 2. If status is Cancelled, force schedule_date to NULL
    IF LOWER(TRIM(p_status)) = 'cancelled' THEN
        SET v_clean_date = NULL;
    ELSE
        SET v_clean_date = p_schedule_date;
    END IF;

    -- 3. Insert the record into client_status_logs
    INSERT INTO client_status_logs (
        client_id,
        client_name,
        status,
        schedule_date,
        notes,
        created_by,
        created_by_name
    ) VALUES (
        p_client_id,
        TRIM(p_client_name),
        TRIM(p_status),
        v_clean_date,
        TRIM(p_notes),
        p_created_by,
        TRIM(p_created_by_name)
    );

    SET v_new_id = LAST_INSERT_ID();

    -- 4. (Optional) If you maintain a main `clients` or `leads` table, 
    -- you can also update its current status here:
    /*
    UPDATE clients 
    SET 
        current_status = TRIM(p_status),
        next_schedule_date = v_clean_date,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_client_id;
    */

    -- 5. Return the saved record back to the caller
    SELECT 
        id,
        client_id,
        client_name,
        status,
        schedule_date,
        notes,
        created_by,
        created_by_name,
        created_at
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_booking`(
    IN p_id             INT,
    IN p_name           VARCHAR(150),
    IN p_mobile         VARCHAR(25),
    IN p_address        TEXT,
    IN p_notes          TEXT,
    IN p_status         VARCHAR(50),
    IN p_state_id       INT,
    IN p_state_name     VARCHAR(100),
    IN p_district_id    INT,
    IN p_district_name  VARCHAR(100),
    IN p_area_id        INT,
    IN p_area_name      VARCHAR(100),
    IN p_documents      JSON
)
BEGIN
    DECLARE v_state_name VARCHAR(100);
    DECLARE v_district_name VARCHAR(100);
    DECLARE v_area_name VARCHAR(100);

    SET v_state_name = p_state_name;
    SET v_district_name = p_district_name;
    SET v_area_name = p_area_name;

    -- Auto-resolve state_name if null but state_id is provided
    IF (v_state_name IS NULL OR TRIM(v_state_name) = '') AND p_state_id IS NOT NULL THEN
        SELECT name INTO v_state_name FROM states WHERE id = p_state_id LIMIT 1;
    END IF;

    -- Auto-resolve district_name if null but district_id is provided
    IF (v_district_name IS NULL OR TRIM(v_district_name) = '') AND p_district_id IS NOT NULL THEN
        SELECT name INTO v_district_name FROM districts WHERE id = p_district_id LIMIT 1;
    END IF;

    -- Auto-resolve area_name if null but area_id is provided
    IF (v_area_name IS NULL OR TRIM(v_area_name) = '') AND p_area_id IS NOT NULL THEN
        SELECT name INTO v_area_name FROM areas WHERE id = p_area_id LIMIT 1;
    END IF;

    -- Update booking (uses COALESCE to keep existing values for any unpassed fields)
    UPDATE bookings
    SET 
        name          = COALESCE(p_name, name),
        mobile        = COALESCE(p_mobile, mobile),
        address       = COALESCE(p_address, address),
        notes         = COALESCE(p_notes, notes),
        status        = COALESCE(p_status, status),
        state_id      = COALESCE(p_state_id, state_id),
        state_name    = COALESCE(v_state_name, state_name),
        district_id   = COALESCE(p_district_id, district_id),
        district_name = COALESCE(v_district_name, district_name),
        area_id       = COALESCE(p_area_id, area_id),
        area_name     = COALESCE(v_area_name, area_name),
        documents     = COALESCE(p_documents, documents),
        updated_at    = CURRENT_TIMESTAMP
    WHERE id = p_id AND is_deleted = 0;

    -- Return the updated booking record back to the frontend
    SELECT 
        id, name, mobile, address, notes, status,
        login_role_id, login_id, login_name,
        state_id, state_name, district_id, district_name,
        area_id, area_name, documents,
        is_deleted, created_at, updated_at
    FROM bookings
    WHERE id = p_id AND is_deleted = 0;
END$$
DELIMITER ;
