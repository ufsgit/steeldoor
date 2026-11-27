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
CREATE DEFINER=`root`@`localhost` PROCEDURE `deactivate_device_token`(
    IN p_user_id   INT,
    IN p_fcm_token VARCHAR(500)
)
BEGIN
    UPDATE user_devices
    SET is_active = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id 
      AND fcm_token = p_fcm_token;

    SELECT 200 AS status, 'Device token deactivated.' AS message;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_booking`(
    IN p_id                  INT,          -- 1. Booking ID to delete
    IN p_action_by_id        INT,          -- 2. User ID who deleted
    IN p_action_by_name      VARCHAR(150), -- 3. User Name who deleted
    IN p_action_by_role_id   INT           -- 4. User Role ID (e.g. 1 for Admin)
)
BEGIN
    DECLARE v_booking_name VARCHAR(150);
    DECLARE v_status_id INT;
    DECLARE v_status_code VARCHAR(50);
    DECLARE v_status_label VARCHAR(100);
    DECLARE v_status_color_code VARCHAR(20);
    DECLARE v_schedule_date DATE;
    DECLARE v_branch_head_id INT;
    DECLARE v_branch_head_name VARCHAR(150);
    DECLARE v_assigned_head_district_id INT;
    DECLARE v_assigned_head_district_name VARCHAR(100);
    DECLARE v_assigned_head_area_id INT;
    DECLARE v_assigned_head_area_name VARCHAR(100);
    DECLARE v_affected_rows INT DEFAULT 0;

    -- 1. Fetch current booking details before deleting
    SELECT 
        name,
        status_id, status_code, status_label, status_color_code,
        schedule_date,
        branch_head_id, branch_head_name,
        assigned_head_district_id, assigned_head_district_name,
        assigned_head_area_id, assigned_head_area_name
    INTO 
        v_booking_name,
        v_status_id, v_status_code, v_status_label, v_status_color_code,
        v_schedule_date,
        v_branch_head_id, v_branch_head_name,
        v_assigned_head_district_id, v_assigned_head_district_name,
        v_assigned_head_area_id, v_assigned_head_area_name
    FROM bookings 
    WHERE id = p_id AND is_deleted = 0
    LIMIT 1;

    -- 2. Only proceed if active booking exists
    IF v_booking_name IS NOT NULL THEN

        -- Insert History Log: Action Type 7 ('BOOKING_DELETED')
        INSERT INTO booking_history (
            booking_id, booking_name,
            action_type_id, action_type, action_type_color_code,
            old_status_id, old_status_code, old_status_label, old_status_color_code,
            new_status_id, new_status_code, new_status_label, new_status_color_code,
            old_schedule_date, new_schedule_date,
            from_branch_head_id, from_branch_head_name,
            to_branch_head_id, to_branch_head_name,
            from_assigned_head_district_id, from_assigned_head_district_name,
            to_assigned_head_district_id, to_assigned_head_district_name,
            from_assigned_head_area_id, from_assigned_head_area_name,
            to_assigned_head_area_id, to_assigned_head_area_name,
            action_by_id, action_by_name, action_by_role_id
        ) VALUES (
            p_id, v_booking_name,
            7, 'Booking Deleted', '#ef4444',
            v_status_id, v_status_code, v_status_label, v_status_color_code,
            v_status_id, v_status_code, v_status_label, v_status_color_code,
            v_schedule_date, v_schedule_date,
            v_branch_head_id, v_branch_head_name,
            v_branch_head_id, v_branch_head_name,
            v_assigned_head_district_id, v_assigned_head_district_name,
            v_assigned_head_district_id, v_assigned_head_district_name,
            v_assigned_head_area_id, v_assigned_head_area_name,
            v_assigned_head_area_id, v_assigned_head_area_name,
            p_action_by_id, TRIM(p_action_by_name), p_action_by_role_id
        );

        -- Perform soft delete
        UPDATE bookings
        SET 
            is_deleted = 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_id AND is_deleted = 0;

        SET v_affected_rows = ROW_COUNT();

    END IF;

    -- 3. Return status of deletion
    SELECT 
        p_id AS id,
        v_affected_rows AS affected_rows,
        CASE WHEN v_affected_rows > 0 THEN 1 ELSE 0 END AS success;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_action_types`()
BEGIN
    SELECT 
        id,
        code,
        name,
        color_code AS colorCode,
        sort_order AS sortOrder,
        is_active AS isActive
    FROM `action_types`
    WHERE is_active = 1
    ORDER BY sort_order ASC, name ASC;
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_available_branch_districts`(
    IN p_user_id INT -- Pass NULL (or 0) for Add/New User, or the user's ID when Editing
)
BEGIN
    SELECT 
        d.id,
        d.name,
        d.code,
        d.state_id AS stateId
    FROM districts d
    WHERE d.id NOT IN (
        -- Districts already assigned to active, non-deleted branch heads
        SELECT u.district_id 
        FROM users u
        WHERE u.district_id IS NOT NULL 
          AND u.is_deleted = 0 
          AND u.is_active = 1
          AND (p_user_id IS NULL OR p_user_id = 0 OR u.id != p_user_id)
    )
    ORDER BY d.name ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_bookings_paginated`(
    IN p_page        INT,           -- Page number (e.g. 1, 2, 3...)
    IN p_limit       INT,           -- Number of records per page (default: 15)
    IN p_role_id     INT,           -- User role_id (1: company, 2: coordinator, 3: branch_head, 4: dealer, 5: customer)
    IN p_login_id    INT,           -- User login ID
    IN p_district_id INT,           -- Filter district ID
    IN p_status_id   INT,           -- Filter by status_id (e.g. 1: New, 2: Scheduled, etc.)
    IN p_search      VARCHAR(150),  -- Search client name or phone/mobile
    IN p_date_from   DATE,          -- Filter created date from
    IN p_date_to     DATE,          -- Filter created date to
    IN p_filter_role INT,           -- Filter by customer login_role_id (1: company, 2: coordinator, 3: branch_head, 4: dealer, 5: customer)
    IN p_is_followup INT            -- 1: Follow-ups only (status_is_followup = 1), 0/NULL: All
)
BEGIN
    DECLARE v_limit INT DEFAULT 15;
    DECLARE v_page INT DEFAULT 1;
    DECLARE v_offset INT DEFAULT 0;
    DECLARE v_search VARCHAR(160) DEFAULT NULL;
    DECLARE v_date_to_exclusive DATETIME DEFAULT NULL;

    -- 1. Pagination settings
    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_page = p_page;
    END IF;

    SET v_offset = (v_page - 1) * v_limit;

    -- 2. Sargable Date Boundaries (Maintains B-Tree index scan on created_at)
    IF p_date_to IS NOT NULL THEN
        SET v_date_to_exclusive = DATE_ADD(p_date_to, INTERVAL 1 DAY);
    END IF;

    -- 3. Search pattern
    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search = CONCAT('%', TRIM(p_search), '%');
    END IF;

    -- =========================================================================
    -- Query 1: Fetch Paginated Bookings
    -- =========================================================================
    SELECT 
        b.id,
        b.name,
        b.mobile,
        b.address,
        b.notes,
        b.map_link,
        b.staff_notes,
        b.status_id,
        b.status_code,
        b.status_label,
        b.status_color_code,
        b.status_is_followup,
        b.schedule_date,
        b.login_role_id,
        b.login_id,
        b.login_name,
        b.state_id,
        b.state_name,
        b.district_id,
        b.district_name,
        b.area_id,
        b.area_name,
        b.assigned_head_district_id,
        b.assigned_head_district_name,
        b.assigned_head_area_id,
        b.assigned_head_area_name,
        b.branch_head_id,
        b.branch_head_name,
        b.documents,
        b.created_at,
        b.updated_at
    FROM bookings b
    LEFT JOIN area_assigned aa 
        ON aa.area_id = b.assigned_head_area_id 
       AND aa.user_id = p_login_id
       AND p_role_id = 3
    WHERE b.is_deleted = 0
      -- Role Scoping
      AND (
          (p_role_id IN (1, 2) OR p_role_id IS NULL)
          OR (p_role_id = 3 AND (b.branch_head_id = p_login_id OR aa.id IS NOT NULL))
          OR (p_role_id NOT IN (1, 2, 3) AND b.login_id = p_login_id)
      )
      -- Optional District Filter
      AND (
          p_district_id IS NULL OR p_district_id <= 0 
          OR b.district_id = p_district_id 
          OR b.assigned_head_district_id = p_district_id
      )
      -- Search Filter
      AND (
          v_search IS NULL 
          OR b.name LIKE v_search 
          OR b.mobile LIKE v_search
      )
      -- Status Filter
      AND (p_status_id IS NULL OR p_status_id <= 0 OR b.status_id = p_status_id)
      -- Sargable Date Filter
      AND (p_date_from IS NULL OR b.created_at >= p_date_from)
      AND (v_date_to_exclusive IS NULL OR b.created_at < v_date_to_exclusive)
      -- Role Filter
      AND (p_filter_role IS NULL OR p_filter_role <= 0 OR b.login_role_id = p_filter_role)
      -- Follow-up Filter
      AND (p_is_followup IS NULL OR p_is_followup = 0 OR b.status_is_followup = p_is_followup)
    ORDER BY b.created_at DESC
    LIMIT v_limit OFFSET v_offset;

    -- =========================================================================
    -- Query 2: Pagination Total Count
    -- =========================================================================
    SELECT 
        COUNT(*) AS total_records,
        v_page AS current_page,
        v_limit AS page_size,
        CEIL(COUNT(*) / v_limit) AS total_pages
    FROM bookings b
    LEFT JOIN area_assigned aa 
        ON aa.area_id = b.assigned_head_area_id 
       AND aa.user_id = p_login_id
       AND p_role_id = 3
    WHERE b.is_deleted = 0
      AND (
          (p_role_id IN (1, 2) OR p_role_id IS NULL)
          OR (p_role_id = 3 AND (b.branch_head_id = p_login_id OR aa.id IS NOT NULL))
          OR (p_role_id NOT IN (1, 2, 3) AND b.login_id = p_login_id)
      )
      AND (
          p_district_id IS NULL OR p_district_id <= 0 
          OR b.district_id = p_district_id 
          OR b.assigned_head_district_id = p_district_id
      )
      AND (
          v_search IS NULL 
          OR b.name LIKE v_search 
          OR b.mobile LIKE v_search
      )
      AND (p_status_id IS NULL OR p_status_id <= 0 OR b.status_id = p_status_id)
      AND (p_date_from IS NULL OR b.created_at >= p_date_from)
      AND (v_date_to_exclusive IS NULL OR b.created_at < v_date_to_exclusive)
      AND (p_filter_role IS NULL OR p_filter_role <= 0 OR b.login_role_id = p_filter_role)
      AND (p_is_followup IS NULL OR p_is_followup = 0 OR b.status_is_followup = p_is_followup);

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_booking_history`(
    IN p_search         VARCHAR(150),
    IN p_action_type_id INT,       
    IN p_new_status_id  INT,
    IN p_from_date      DATE,
    IN p_to_date        DATE,
    IN p_page           INT,
    IN p_limit          INT,
    IN p_user_id        INT,
    IN p_role_id        INT
)
BEGIN
    DECLARE v_offset INT DEFAULT 0;
    DECLARE v_search VARCHAR(160) DEFAULT NULL;
    DECLARE v_to_date_exclusive DATETIME DEFAULT NULL;

    -- Handle pagination defaults
    IF p_page IS NULL OR p_page < 1 THEN
        SET p_page = 1;
    END IF;
    
    IF p_limit IS NULL OR p_limit < 1 THEN
        SET p_limit = 20;
    END IF;

    SET v_offset = (p_page - 1) * p_limit;

    -- Sargable Date Boundary (Preserves B-Tree index scan on created_at)
    IF p_to_date IS NOT NULL THEN
        SET v_to_date_exclusive = DATE_ADD(p_to_date, INTERVAL 1 DAY);
    END IF;

    -- Search prefix pattern
    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search = CONCAT(TRIM(p_search), '%');
    END IF;

    -- =========================================================================
    -- Query 1: Main Paginated History Results
    -- =========================================================================
    SELECT 
        bh.history_id,
        bh.booking_id,
        bh.booking_name,
        bh.action_type_id,
        bh.action_type,
        bh.action_type_color_code,
        bh.customer_note,
        bh.staff_note,
        bh.old_status_id,
        bh.old_status_code,
        bh.old_status_label,
        bh.old_status_color_code,
        bh.new_status_id,
        bh.new_status_code,
        bh.new_status_label,
        bh.new_status_color_code,
        bh.old_schedule_date,
        bh.new_schedule_date,
        bh.from_branch_head_id,
        bh.from_branch_head_name,
        bh.to_branch_head_id,
        bh.to_branch_head_name,
        bh.from_assigned_head_district_id,
        bh.from_assigned_head_district_name,
        bh.from_assigned_head_area_id,
        bh.from_assigned_head_area_name,
        bh.to_assigned_head_district_id,
        bh.to_assigned_head_district_name,
        bh.to_assigned_head_area_id,
        bh.to_assigned_head_area_name,
        bh.action_by_id,
        bh.action_by_name,
        bh.action_by_role_id,
        bh.created_at
    FROM `booking_history` bh
    LEFT JOIN `area_assigned` aa 
        ON aa.area_id = bh.to_assigned_head_area_id 
       AND aa.user_id = p_user_id 
       AND p_role_id = 3
    WHERE 
        -- Sargable Date Range filter (Uses index on created_at)
        (p_from_date IS NULL OR bh.created_at >= p_from_date)
        AND (v_to_date_exclusive IS NULL OR bh.created_at < v_to_date_exclusive)

        -- Booking name prefix search
        AND (v_search IS NULL OR bh.booking_name LIKE v_search)

        -- Action Type ID filter (0 or NULL = ALL)
        AND (p_action_type_id IS NULL OR p_action_type_id = 0 OR bh.action_type_id = p_action_type_id)

        -- Status ID filter (0 or NULL = ALL, -1 = Not Completed, otherwise exact ID)
        AND (
            p_new_status_id IS NULL 
            OR p_new_status_id = 0 
            OR (p_new_status_id = -1 AND (bh.new_status_id IS NULL OR bh.new_status_id != 3))
            OR bh.new_status_id = p_new_status_id
        )

        -- Role-based restriction:
        -- Role 1 (Company) & Role 2 (Coordinator): See all
        -- Role 3 (Branch Head): Sees actions performed by them, targeted to them, or in their assigned areas
        AND (
            (p_role_id IN (1, 2) OR p_role_id IS NULL)
            OR (p_role_id = 3 AND (
                bh.action_by_id = p_user_id
                OR bh.to_branch_head_id = p_user_id
                OR bh.from_branch_head_id = p_user_id
                OR aa.id IS NOT NULL
            ))
        )
    ORDER BY bh.created_at DESC, bh.history_id DESC
    LIMIT p_limit OFFSET v_offset;

    -- =========================================================================
    -- Query 2: Pagination Metadata (Total Records and Pages)
    -- =========================================================================
    SELECT 
        COUNT(*) AS total_records,
        p_page AS current_page,
        p_limit AS page_size,
        CEIL(COUNT(*) / p_limit) AS total_pages
    FROM `booking_history` bh
    LEFT JOIN `area_assigned` aa 
        ON aa.area_id = bh.to_assigned_head_area_id 
       AND aa.user_id = p_user_id 
       AND p_role_id = 3
    WHERE 
        (p_from_date IS NULL OR bh.created_at >= p_from_date)
        AND (v_to_date_exclusive IS NULL OR bh.created_at < v_to_date_exclusive)
        AND (v_search IS NULL OR bh.booking_name LIKE v_search)
        AND (p_action_type_id IS NULL OR p_action_type_id = 0 OR bh.action_type_id = p_action_type_id)
        AND (
            p_new_status_id IS NULL 
            OR p_new_status_id = 0 
            OR (p_new_status_id = -1 AND (bh.new_status_id IS NULL OR bh.new_status_id != 3))
            OR bh.new_status_id = p_new_status_id
        )
        AND (
            (p_role_id IN (1, 2) OR p_role_id IS NULL)
            OR (p_role_id = 3 AND (
                bh.action_by_id = p_user_id
                OR bh.to_branch_head_id = p_user_id
                OR bh.from_branch_head_id = p_user_id
                OR aa.id IS NOT NULL
            ))
        );

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_booking_reports`(
    IN p_role_id                   INT,          -- 1 (Company), 2 (Coordinator), 3 (Branch Head)
    IN p_login_id                  INT,          -- Login User ID
    IN p_assigned_head_district_id INT,          -- Branch Head Assigned District ID
    IN p_date_from                 DATE,         -- Optional Custom Start Date
    IN p_date_to                   DATE          -- Optional Custom End Date
)
BEGIN
    DECLARE v_from DATE;
    DECLARE v_to DATE;
    DECLARE v_diff INT;
    DECLARE v_granularity VARCHAR(10);

    -- 1. Default date range if not provided (default: last 7 days)
    SET v_to = COALESCE(p_date_to, CURDATE());
    SET v_from = COALESCE(p_date_from, DATE_SUB(v_to, INTERVAL 6 DAY));
    SET v_diff = DATEDIFF(v_to, v_from);

    -- 2. Determine granularity based on difference
    IF v_diff <= 7 THEN
        SET v_granularity = 'DAY';
    ELSEIF v_diff <= 30 THEN
        SET v_granularity = 'WEEK';
    ELSEIF v_diff <= 365 THEN
        SET v_granularity = 'MONTH';
    ELSE
        SET v_granularity = 'YEAR';
    END IF;

    -- 3. Return grouped multi-status metrics using new_status_id
    SELECT 
        CASE 
            WHEN v_granularity = 'DAY'   THEN DATE_FORMAT(bh.created_at, '%a')                    -- 'Mon', 'Tue'
            WHEN v_granularity = 'WEEK'  THEN CONCAT('Week ', WEEK(bh.created_at, 1))             -- 'Week 42'
            WHEN v_granularity = 'MONTH' THEN DATE_FORMAT(bh.created_at, '%b %Y')                 -- 'Oct 2026'
            ELSE DATE_FORMAT(bh.created_at, '%Y')                                                 -- '2026'
        END AS period_label,

        CASE 
            WHEN v_granularity = 'DAY'   THEN DATE(bh.created_at)
            WHEN v_granularity = 'WEEK'  THEN STR_TO_DATE(CONCAT(YEARWEEK(bh.created_at, 1), ' Monday'), '%X%V %W')
            WHEN v_granularity = 'MONTH' THEN DATE_FORMAT(bh.created_at, '%Y-%m-01')
            ELSE DATE_FORMAT(bh.created_at, '%Y-01-01')
        END AS period_date,

        -- Status Counts strictly by new_status_id
        COUNT(CASE WHEN bh.new_status_id = 1 THEN 1 END) AS new_count,
        COUNT(CASE WHEN bh.new_status_id = 2 THEN 1 END) AS scheduled_count,
        COUNT(CASE WHEN bh.new_status_id = 3 THEN 1 END) AS completed_count,
        COUNT(CASE WHEN bh.new_status_id = 4 THEN 1 END) AS cancelled_count,
        (
			COUNT(CASE WHEN bh.new_status_id = 1 THEN 1 END) +
			COUNT(CASE WHEN bh.new_status_id = 2 THEN 1 END) +
			COUNT(CASE WHEN bh.new_status_id = 3 THEN 1 END) +
			COUNT(CASE WHEN bh.new_status_id = 4 THEN 1 END)
		) AS total_activities

    FROM booking_history bh
    LEFT JOIN bookings b ON b.id = bh.booking_id
    WHERE DATE(bh.created_at) BETWEEN v_from AND v_to
		AND bh.action_type IN ('Status Updated', 'New Booking Created')
      -- Scoping strictly for Roles 1, 2, and 3
      AND (
          p_role_id IN (1, 2)                                                              -- Role 1 & 2: Full access
          OR (p_role_id = 3 AND (b.assigned_head_district_id = p_assigned_head_district_id OR b.district_id = p_assigned_head_district_id)) -- Role 3: Branch Head by assigned district
      )
    GROUP BY period_label, period_date
    ORDER BY period_date ASC;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_branch_heads_for_status_update`(
    IN p_search VARCHAR(100), -- Optional: Search by branch head, area, district, or pincode
    IN p_page   INT,          -- Page number (e.g. 1, 2, ...; NULL defaults to 1)
    IN p_limit  INT           -- Items per page (e.g. 20; NULL or <= 0 defaults to 20)
)
BEGIN
    DECLARE v_search VARCHAR(105);
    DECLARE v_page   INT DEFAULT 1;
    DECLARE v_limit  INT DEFAULT 20;
    DECLARE v_offset INT DEFAULT 0;

    -- 1. Sanitize Pagination
    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_page = p_page;
    END IF;

    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    SET v_offset = (v_page - 1) * v_limit;

    -- 2. Prepare Search Pattern
    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search = CONCAT('%', TRIM(p_search), '%');
    ELSE
        SET v_search = NULL;
    END IF;

    -- 3. Query Paginated Records
    SELECT 
        u.id                                     AS branch_head_id,
        u.name                                   AS branch_head_name,
        aa.district_id,
        aa.district_name,
        aa.area_id,
        aa.area_name,
        aa.area_pincode,
        CONCAT(u.name, ' (', aa.district_name, ' - ', aa.area_name, ')') AS display_label
    FROM area_assigned aa
    INNER JOIN users u ON u.id = aa.user_id
    WHERE u.role_id = 3                          -- Branch Head role
      AND u.is_active = 1                        -- Active user
      AND u.is_deleted = 0                       -- Not soft-deleted
      AND (
          v_search IS NULL
          OR u.name LIKE v_search                -- Search by Branch Head Name
          OR aa.area_name LIKE v_search          -- Search by Area Name
          OR aa.district_name LIKE v_search      -- Search by District Name
          OR aa.area_pincode LIKE v_search       -- Search by Pincode
      )
    ORDER BY 
        aa.district_name ASC, 
        u.name ASC, 
        aa.area_name ASC
    LIMIT v_limit OFFSET v_offset;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_dashboard_metrics`(
    IN p_period                    VARCHAR(20),  -- Filter: 'all', 'this_month', 'last_30_days' (default: 'this_month')
    IN p_role_id                   INT,          -- Optional Role ID: 1 (Company), 2 (Coordinator), 3 (Branch Head), 4 (Dealer), 5 (Customer)
    IN p_login_id                  INT,          -- Optional Login User ID
    IN p_assigned_head_district_id INT,          -- Optional Assigned Head District ID filter
    IN p_date_from                 DATE,         -- Optional Custom Start Date
    IN p_date_to                   DATE          -- Optional Custom End Date
)
BEGIN
    DECLARE v_from_date                 DATE DEFAULT NULL;
    DECLARE v_to_date                   DATE DEFAULT NULL;
    DECLARE v_assigned_head_district_id INT DEFAULT p_assigned_head_district_id;
    DECLARE v_period                    VARCHAR(20) DEFAULT 'this_month';

    -- 1. Standardize period preset
    IF p_period IS NOT NULL AND TRIM(p_period) != '' THEN
        SET v_period = LOWER(TRIM(p_period));
    END IF;

    -- 2. Calculate Date Windows
    IF v_period = 'this_month' THEN
        SET v_from_date = DATE_FORMAT(CURRENT_DATE, '%Y-%m-01');
        SET v_to_date   = LAST_DAY(CURRENT_DATE);
    ELSEIF v_period = 'last_30_days' THEN
        SET v_from_date = DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY);
        SET v_to_date   = CURRENT_DATE;
    ELSEIF v_period = 'all' THEN
        SET v_from_date = NULL;
        SET v_to_date   = NULL;
    END IF;

    -- Custom explicit date arguments override preset
    IF p_date_from IS NOT NULL THEN
        SET v_from_date = p_date_from;
    END IF;
    IF p_date_to IS NOT NULL THEN
        SET v_to_date = p_date_to;
    END IF;

    -- 3. Auto-resolve Branch Head (Role 3) district if not supplied
    IF p_role_id = 3 AND (v_assigned_head_district_id IS NULL OR v_assigned_head_district_id <= 0) AND p_login_id IS NOT NULL THEN
        SELECT district_id INTO v_assigned_head_district_id
        FROM users
        WHERE id = p_login_id AND is_deleted = 0
        LIMIT 1;
    END IF;

    -- 4. Calculate Metric Cards
    SELECT 
        -- Card: New Bookings (Status NEW within last 24 hours)
        COUNT(CASE 
            WHEN UPPER(TRIM(status_code)) = 'NEW' 
                 AND created_at >= NOW() - INTERVAL 24 HOUR 
            THEN 1 
        END) AS new_bookings,

        -- Card: Pending Bookings (Status NEW older than 24 hours)
        COUNT(CASE 
            WHEN UPPER(TRIM(status_code)) = 'NEW' 
                 AND created_at < NOW() - INTERVAL 24 HOUR 
            THEN 1 
        END) AS pending_bookings,

        -- Card: Total Scheduled Bookings
        COUNT(CASE 
            WHEN UPPER(TRIM(status_code)) IN ('SCHEDULED', 'ACCEPTED') 
            THEN 1 
        END) AS scheduled_bookings,

        -- Card: Today's Scheduled (schedule_date = today)
        COUNT(CASE 
            WHEN UPPER(TRIM(status_code)) IN ('SCHEDULED', 'ACCEPTED') 
                 AND schedule_date = CURRENT_DATE 
            THEN 1 
        END) AS today_scheduled_bookings,

        -- Card: Upcoming Installations (schedule_date > today)
        COUNT(CASE 
            WHEN UPPER(TRIM(status_code)) IN ('SCHEDULED', 'ACCEPTED') 
                 AND schedule_date > CURRENT_DATE 
            THEN 1 
        END) AS upcoming_installations,

        -- Card: Delayed Bookings (schedule_date < today)
        COUNT(CASE 
            WHEN UPPER(TRIM(status_code)) IN ('SCHEDULED', 'ACCEPTED') 
                 AND schedule_date < CURRENT_DATE 
            THEN 1 
        END) AS delayed_bookings,

        -- Card: Completed Bookings
        COUNT(CASE 
            WHEN UPPER(TRIM(status_code)) IN ('COMPLETED', 'FINISHED') 
            THEN 1 
        END) AS completed_bookings,

        -- Card: Cancelled Bookings
        COUNT(CASE 
            WHEN UPPER(TRIM(status_code)) IN ('CANCELLED', 'CANCELED') 
            THEN 1 
        END) AS cancelled_bookings,

        -- Aggregate Total Bookings
        COUNT(*) AS total_bookings,

        -- Metadata returned for UI display
        v_period                    AS active_period,
        v_from_date                 AS date_from,
        v_to_date                   AS date_to
    FROM bookings
    WHERE is_deleted = 0
      -- Role Scoping
      AND (
          p_role_id IS NULL OR p_role_id IN (1, 2)
          OR (p_role_id = 3 AND (
              branch_head_id = p_login_id 
              OR assigned_head_district_id = v_assigned_head_district_id
          ))
          OR (p_role_id NOT IN (1, 2, 3) AND login_id = p_login_id)
      )
      -- District Filter using assigned_head_district_id
      AND (
          v_assigned_head_district_id IS NULL 
          OR v_assigned_head_district_id <= 0 
          OR assigned_head_district_id = v_assigned_head_district_id
      )
      -- Date Filter
      AND (v_from_date IS NULL OR DATE(created_at) >= v_from_date)
      AND (v_to_date IS NULL OR DATE(created_at) <= v_to_date);

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_district_areas_assignment_status`(
    IN p_district_ids VARCHAR(500), -- Comma-separated selected district IDs (e.g. '1,2,5'); NULL/'' = none selected (0 rows); 'ALL' = all districts
    IN p_search       VARCHAR(100), -- Matches area name, pincode, or district name
    IN p_user_id      INT,          -- NULL when creating user; user ID when editing
    IN p_page         INT,          -- Page number (default 1)
    IN p_limit        INT           -- Rows per page (default 20)
)
BEGIN
    DECLARE v_district_ids VARCHAR(500) DEFAULT NULL;
    DECLARE v_show_all     TINYINT(1)   DEFAULT 0;
    DECLARE v_search       VARCHAR(105) DEFAULT NULL;
    DECLARE v_page         INT          DEFAULT 1;
    DECLARE v_limit        INT          DEFAULT 20;
    DECLARE v_offset       INT          DEFAULT 0;

    IF p_district_ids IS NOT NULL AND TRIM(p_district_ids) != '' THEN
        IF UPPER(TRIM(p_district_ids)) = 'ALL' THEN
            SET v_show_all = 1;
        ELSE
            SET v_district_ids = TRIM(BOTH ',' FROM REPLACE(TRIM(p_district_ids), ' ', ''));
            IF v_district_ids = '' OR v_district_ids = '0' THEN
                SET v_district_ids = NULL;
            END IF;
        END IF;
    END IF;

    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search = TRIM(p_search);
    END IF;

    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_page = p_page;
    END IF;

    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    SET v_offset = (v_page - 1) * v_limit;

    -- Result Set 1: Paginated Areas filtered strictly to selected District(s)
    SELECT 
        a.id,
        a.district_id,
        d.name AS district_name,
        a.name,
        a.pincode,
        u.id   AS assigned_user_id,
        u.name AS assigned_user_name,
        -- 1 = Assigned to another active user (Locked / Red)
        -- 0 = Free OR assigned to the user being edited (Selectable / Green)
        (u.id IS NOT NULL AND (p_user_id IS NULL OR aa.user_id != p_user_id)) AS is_assigned_to_other
    FROM areas a
    INNER JOIN districts d ON a.district_id = d.id
    LEFT JOIN area_assigned aa ON a.id = aa.area_id
    LEFT JOIN users u ON aa.user_id = u.id AND u.is_deleted = 0
    WHERE a.is_deleted = 0
      AND (
          v_show_all = 1
          OR (v_district_ids IS NOT NULL AND FIND_IN_SET(CAST(a.district_id AS CHAR), v_district_ids) > 0)
      )
      AND (
          v_search IS NULL
          OR a.name    LIKE CONCAT('%', v_search, '%')
          OR a.pincode LIKE CONCAT('%', v_search, '%')
          OR d.name    LIKE CONCAT('%', v_search, '%')
      )
    ORDER BY d.name ASC, a.name ASC
    LIMIT v_limit OFFSET v_offset;

    -- Result Set 2: Pagination Metadata
    SELECT 
        COUNT(*) AS total,
        v_page   AS page,
        v_limit  AS `limit`,
        GREATEST(1, CEIL(COUNT(*) / v_limit)) AS total_pages
    FROM areas a
    INNER JOIN districts d ON a.district_id = d.id
    WHERE a.is_deleted = 0
      AND (
          v_show_all = 1
          OR (v_district_ids IS NOT NULL AND FIND_IN_SET(CAST(a.district_id AS CHAR), v_district_ids) > 0)
      )
      AND (
          v_search IS NULL
          OR a.name    LIKE CONCAT('%', v_search, '%')
          OR a.pincode LIKE CONCAT('%', v_search, '%')
          OR d.name    LIKE CONCAT('%', v_search, '%')
      );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_history_by_bookingid`(
    IN p_booking_id INT,
    IN p_page INT,
    IN p_limit INT
)
BEGIN
    DECLARE v_offset INT DEFAULT 0;

    IF p_page IS NULL OR p_page < 1 THEN
        SET p_page = 1;
    END IF;

    IF p_limit IS NULL OR p_limit < 1 THEN
        SET p_limit = 10;
    END IF;

    SET v_offset = (p_page - 1) * p_limit;

    SELECT 
        bh.*
    FROM `booking_history` bh
    WHERE 
        bh.booking_id = p_booking_id
    ORDER BY bh.created_at DESC, bh.history_id DESC
    LIMIT p_limit OFFSET v_offset;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_status_options`()
BEGIN
    SELECT 
        id,
        code,
        label,
        color_code AS colorCode,
        sort_order AS sortOrder,
        is_active AS isActive,
        is_followup AS isFollowUp,
        is_date AS isDate
    FROM status_options
    WHERE is_active = 1
    ORDER BY sort_order ASC, id ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_user_active_tokens`(
    IN p_user_id INT
)
BEGIN
    SELECT 
        id,
        user_id     AS userId,
        fcm_token   AS fcmToken,
        device_type AS deviceType,
        device_id   AS deviceId
    FROM user_devices
    WHERE user_id = p_user_id 
      AND is_active = 1;
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `register_or_update_device`(
    IN p_user_id     INT,
    IN p_fcm_token   VARCHAR(500),
    IN p_device_type VARCHAR(20),
    IN p_device_id   VARCHAR(150)
)
BEGIN
    DECLARE v_device_id_found INT DEFAULT NULL;

    -- Deactivate this token if previously associated with another user on the same phone
    UPDATE user_devices
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE fcm_token = p_fcm_token AND user_id != p_user_id;

    -- Check if record exists for this user and token/device
    SELECT id INTO v_device_id_found
    FROM user_devices
    WHERE user_id = p_user_id 
      AND (fcm_token = p_fcm_token OR (p_device_id IS NOT NULL AND device_id = p_device_id))
    LIMIT 1;

    IF v_device_id_found IS NOT NULL THEN
        UPDATE user_devices
        SET fcm_token   = p_fcm_token,
            device_type = COALESCE(p_device_type, device_type),
            device_id   = COALESCE(p_device_id, device_id),
            is_active   = 1,
            updated_at  = CURRENT_TIMESTAMP
        WHERE id = v_device_id_found;

        SELECT 200 AS status, 'Device token updated.' AS message, v_device_id_found AS id;
    ELSE
        INSERT INTO user_devices (user_id, fcm_token, device_type, device_id, is_active)
        VALUES (p_user_id, p_fcm_token, COALESCE(p_device_type, 'android'), p_device_id, 1);

        SELECT 201 AS status, 'Device registered.' AS message, LAST_INSERT_ID() AS id;
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
    IN p_map_link         TEXT,
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
	DECLARE v_old_name VARCHAR(150);
	DECLARE v_old_notes TEXT;
    
    DECLARE v_status_id INT DEFAULT 1;
    DECLARE v_status_code VARCHAR(50) DEFAULT 'New';
    DECLARE v_status_label VARCHAR(100) DEFAULT 'New';
    DECLARE v_status_color_code VARCHAR(20) DEFAULT '#3b82f6';

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

    -- 5. Auto-resolve Branch Head strictly based on selected area:
    IF p_area_id IS NOT NULL AND p_area_id > 0 THEN
        SET v_branch_head_id = NULL;
        SET v_branch_head_name = NULL;

        SELECT u.id, u.name 
        INTO v_branch_head_id, v_branch_head_name
        FROM area_assigned aa
        JOIN users u ON u.id = aa.user_id
        WHERE aa.area_id = p_area_id 
          AND u.role_id = 3 
          AND u.is_deleted = 0 
          AND u.is_active = 1
        LIMIT 1;
    END IF;

    -- =========================================================================
    -- MODE 1: CREATE (When p_id is NULL or <= 0)
    -- =========================================================================
    IF p_id IS NULL OR p_id <= 0 THEN
        -- Optionally resolve from status_options table if available
        SELECT id, code, label, color_code 
        INTO v_status_id, v_status_code, v_status_label, v_status_color_code
        FROM status_options 
        WHERE id = 1 LIMIT 1;

        INSERT INTO bookings (
            name, mobile, address, notes, map_link,
            status_id, status_code, status_label, status_color_code, status_is_followup,
            login_role_id, login_id, login_name,
            state_id, state_name, district_id, district_name,
            area_id, area_name, assigned_head_district_id, assigned_head_district_name,
            assigned_head_area_id, assigned_head_area_name, 
            branch_head_id, branch_head_name,
            documents
        ) VALUES (
            p_name, p_mobile, p_address, p_notes, p_map_link,
            v_status_id, v_status_code, v_status_label, v_status_color_code, 1,
            p_login_role_id, p_login_id, p_login_name,
            p_state_id, v_state_name, p_district_id, v_district_name,
            p_area_id, v_area_name, p_district_id, v_district_name,
            p_area_id, v_area_name,
            v_branch_head_id, v_branch_head_name,
            p_documents
        );

        SET v_booking_id = LAST_INSERT_ID();
        
        INSERT INTO booking_history (
            booking_id, booking_name, action_type_id,action_type, 
            customer_note, staff_note,
            new_status_id, new_status_code, new_status_label, new_status_color_code, 
            to_branch_head_id, to_branch_head_name,
            to_assigned_head_district_id, to_assigned_head_district_name,
            action_by_id, action_by_name, action_by_role_id
        ) VALUES (
            v_booking_id, p_name, 1,'New Booking Created', 
            p_notes, NULL,
            v_status_id, v_status_code, v_status_label, v_status_color_code,
            v_branch_head_id, v_branch_head_name,
            p_district_id, v_district_name,
            p_login_id, p_login_name, p_login_role_id
        );


    -- =========================================================================
    -- MODE 2: UPDATE (When p_id > 0)
    -- =========================================================================
    ELSE
        -- 1. Fetch current name and note before update
        SELECT name, notes 
        INTO v_old_name, v_old_notes
        FROM bookings
        WHERE id = p_id AND is_deleted = 0;

	UPDATE bookings
		SET 
			name             = COALESCE(p_name, name),
			mobile           = COALESCE(p_mobile, mobile),
			address          = COALESCE(p_address, address),	
			notes            = COALESCE(p_notes, notes), 
			map_link         = COALESCE(p_map_link, map_link),
			login_role_id    = COALESCE(p_login_role_id, login_role_id),
			login_id         = COALESCE(p_login_id, login_id),
			login_name       = COALESCE(p_login_name, login_name),
			documents        = COALESCE(p_documents, documents),
			updated_at       = CURRENT_TIMESTAMP
		WHERE id = p_id AND is_deleted = 0;

        SET v_booking_id = p_id;

        -- 3. Log history if customer name was updated
        IF p_name IS NOT NULL AND TRIM(p_name) <> '' AND (v_old_name IS NULL OR v_old_name <> TRIM(p_name)) THEN
            INSERT INTO booking_history (
                booking_id, booking_name, action_type_id, action_type,
                customer_note, staff_note,
                action_by_id, action_by_name, action_by_role_id
            ) VALUES (
                v_booking_id, 
                TRIM(p_name), 
                5,
                CONCAT('Customer Name Updated from "', COALESCE(v_old_name, ''), '" to "', TRIM(p_name), '"'),
                NULL, 
                NULL,
                p_login_id, 
                p_login_name, 
                p_login_role_id
            );
        END IF;


        -- 4. Log history if customer note was updated
        IF p_notes IS NOT NULL AND (v_old_notes IS NULL OR v_old_notes <> p_notes) THEN
            INSERT INTO booking_history (
                booking_id, booking_name, action_type_id, action_type,
                customer_note, staff_note,
                action_by_id, action_by_name, action_by_role_id
            ) VALUES (
                v_booking_id, COALESCE(TRIM(p_name), v_old_name), 6,'Customer Notes Updated',
                p_notes, NULL,
                p_login_id, p_login_name, p_login_role_id
            );
        END IF;
    END IF;


    -- =========================================================================
    -- RETURN THE SAVED / UPDATED RECORD
    -- =========================================================================
    SELECT 
		id, name, mobile, address, notes, map_link,
        status_id, status_code, status_label, status_color_code, schedule_date,
        login_role_id, login_id, login_name,
        state_id, state_name, district_id, district_name,
		area_id, area_name, 
        assigned_head_district_id, assigned_head_district_name, 
        assigned_head_area_id, assigned_head_area_name,
        branch_head_id, branch_head_name,
        documents, is_deleted, created_at, updated_at
    FROM bookings
    WHERE id = v_booking_id AND is_deleted = 0;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `soft_delete_action_type`(
    IN p_id INT
)
BEGIN
    DECLARE v_affected_rows INT DEFAULT 0;

    UPDATE action_types
    SET is_deleted = 1,
        is_active = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id AND is_deleted = 0;

    SET v_affected_rows = ROW_COUNT();

    IF v_affected_rows > 0 THEN
        SELECT 200 AS status, 'Action type deleted successfully.' AS message;
    ELSE
        SELECT 404 AS status, 'Action type not found or already deleted.' AS message;
    END IF;
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_add_action_type_id_column`()
BEGIN
    -- Check if column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
          AND table_name = 'booking_history' 
          AND column_name = 'action_type_id'
    ) THEN
        -- Add column after booking_name
        ALTER TABLE `booking_history`
        ADD COLUMN `action_type_id` INT DEFAULT NULL AFTER `booking_name`,
        ADD KEY `idx_bh_action_type_id` (`action_type_id`),
        ADD CONSTRAINT `fk_bh_action_type` 
            FOREIGN KEY (`action_type_id`) 
            REFERENCES `action_types` (`id`) 
            ON DELETE SET NULL 
            ON UPDATE CASCADE;

        -- Populate action_type_id for existing rows
        UPDATE `booking_history` bh
        JOIN `action_types` at ON (
            bh.action_type = at.name 
            OR (at.code = 'CUSTOMER_NAME_UPDATED' AND bh.action_type LIKE 'Customer Name Updated%')
            OR (at.code = 'SCHEDULED_DATE_CHANGED' AND bh.action_type LIKE 'Scheduled Date Changed%')
        )
        SET bh.action_type_id = at.id;

        SELECT 200 AS status, 'Column action_type_id added and existing records updated successfully.' AS message;
    ELSE
        SELECT 200 AS status, 'Column action_type_id already exists in booking_history.' AS message;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_assign_user_area`(
    IN p_user_id INT,
    IN p_area_id INT
)
BEGIN
    DECLARE v_user_name VARCHAR(150);
    DECLARE v_district_id INT;
    DECLARE v_district_name VARCHAR(100);
    DECLARE v_area_name VARCHAR(100);
    DECLARE v_area_pincode VARCHAR(10);
    DECLARE v_existing_user_id INT DEFAULT NULL;
    DECLARE v_existing_user_name VARCHAR(150) DEFAULT NULL;
    DECLARE v_new_id INT DEFAULT NULL;

    -- Step 1: Input Validation
    IF p_user_id IS NULL OR p_area_id IS NULL THEN
        SELECT 400 AS status, 'user_id and area_id are required.' AS message, NULL AS id;
    ELSE
        -- Step 2: Fetch and verify User
        SELECT name INTO v_user_name
        FROM users
        WHERE id = p_user_id AND is_deleted = 0
        LIMIT 1;

        IF v_user_name IS NULL THEN
            SELECT 404 AS status, 'User not found or is inactive.' AS message, NULL AS id;
        ELSE
            -- Step 3: Fetch and verify Area from your areas table + District info
            SELECT a.name, a.pincode, a.district_id, d.name
            INTO v_area_name, v_area_pincode, v_district_id, v_district_name
            FROM areas a
            INNER JOIN districts d ON d.id = a.district_id
            WHERE a.id = p_area_id AND a.is_deleted = 0
            LIMIT 1;

            IF v_area_name IS NULL THEN
                SELECT 404 AS status, 'Area not found or has been deleted.' AS message, NULL AS id;
            ELSE
                -- Step 4: Strict Uniqueness Check on area_id
                SELECT user_id, user_name
                INTO v_existing_user_id, v_existing_user_name
                FROM area_assigned
                WHERE area_id = p_area_id
                LIMIT 1;

                IF v_existing_user_id IS NOT NULL THEN
                    IF v_existing_user_id = p_user_id THEN
                        SELECT 409 AS status, 
                               'This area is already assigned to this user.' AS message, 
                               NULL AS id;
                    ELSE
                        -- Blocks assigning an area already owned by someone else
                        SELECT 409 AS status, 
                               CONCAT('Area is already assigned to user: ', v_existing_user_name, ' (User ID: ', v_existing_user_id, '). Area ID must be unique.') AS message, 
                               NULL AS id;
                    END IF;
                ELSE
                    -- Step 5: Insert new assignment
                    INSERT INTO area_assigned (
                        user_id,
                        user_name,
                        district_id,
                        district_name,
                        area_id,
                        area_name,
                        area_pincode
                    ) VALUES (
                        p_user_id,
                        v_user_name,
                        v_district_id,
                        v_district_name,
                        p_area_id,
                        v_area_name,
                        v_area_pincode
                    );

                    SET v_new_id = LAST_INSERT_ID();

                    SELECT 201 AS status, 'Area successfully assigned to user.' AS message, v_new_id AS id;

                    -- Return inserted assignment row
                    SELECT 
                        id,
                        user_id,
                        user_name,
                        district_id,
                        district_name,
                        area_id,
                        area_name,
                        area_pincode,
                        created_at
                    FROM area_assigned
                    WHERE id = v_new_id;
                END IF;
            END IF;
        END IF;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_dropdown_data`(
    IN p_type       VARCHAR(20),
    IN p_parent_id  INT,
    IN p_search     VARCHAR(100),
    IN p_role_id    INT,
    IN p_login_id   INT,
    IN p_page       INT,
    IN p_limit      INT
)
BEGIN
    DECLARE v_search VARCHAR(105);
    DECLARE v_parent_id INT;
    DECLARE v_page INT DEFAULT 1;
    DECLARE v_limit INT DEFAULT 20;
    DECLARE v_offset INT DEFAULT 0;
    
    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search = TRIM(p_search);
    ELSE
        SET v_search = NULL;
    END IF;

    SET v_parent_id = p_parent_id;

    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_page = p_page;
    END IF;

    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    SET v_offset = (v_page - 1) * v_limit;

    -- Safety check: If Role 3 (Branch Head), resolve their assigned district_id
    IF p_role_id = 3 AND p_login_id IS NOT NULL THEN
        SELECT district_id INTO v_parent_id 
        FROM users 
        WHERE id = p_login_id AND is_deleted = 0 
        LIMIT 1;
    END IF;

    -- 1. DISTRICT DROPDOWN
    IF LOWER(TRIM(p_type)) = 'district' THEN
        IF p_role_id = 3 THEN
            SELECT 
                d.id, 
                d.name AS name,
                d.code,
                d.state_id AS stateId
            FROM districts d
            WHERE d.id = v_parent_id
            LIMIT 1;
        ELSE
            SELECT 
                d.id, 
                d.name AS name,
                d.code,
                d.state_id AS stateId
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

    -- 2. AREA DROPDOWN
    ELSEIF LOWER(TRIM(p_type)) = 'area' THEN
        IF p_role_id = 3 THEN
            IF v_parent_id IS NULL THEN
                SELECT NULL AS id, NULL AS name, NULL AS pincode, NULL AS districtId WHERE 1 = 0;
            ELSE
                SELECT 
                    a.id, 
                    a.name,
                    a.pincode,
                    a.district_id AS districtId
                FROM areas a
                WHERE a.district_id = v_parent_id
                  AND a.is_deleted = 0
                  AND (
                        v_search IS NULL 
                        OR a.name LIKE CONCAT('%', v_search, '%') 
                        OR a.pincode LIKE CONCAT('%', v_search, '%')
                      )
                ORDER BY a.name ASC
                LIMIT v_limit OFFSET v_offset;
            END IF;
        ELSE
            SELECT 
                a.id, 
                a.name,
                a.pincode,
                a.district_id AS districtId
            FROM areas a
            WHERE (v_parent_id IS NULL OR a.district_id = v_parent_id)
              AND a.is_deleted = 0
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_seed_steeldoor_data`(
    IN p_execute INT, -- 1 = Proceed, 0 = Abort
    IN p_count   INT  -- Target number of bookings/dealers to seed (e.g. 50, 500, 10000)
)
proc_label: BEGIN
    -- =========================================================================
    -- Execution Guard: 1 = Proceed, 0 = Abort
    -- =========================================================================
    IF p_execute != 1 THEN
        SELECT 'Aborted: p_execute was not 1. No data was modified.' AS `status_message`;
        LEAVE proc_label;
    END IF;

    IF p_count IS NULL OR p_count <= 0 THEN
        SET p_count = 100; -- Default fallback to 100 records if invalid count
    END IF;

    SET SESSION sql_mode = '';
    SET FOREIGN_KEY_CHECKS = 0;

    -- Clear existing dynamic tables cleanly
    TRUNCATE TABLE `booking_history`;
    TRUNCATE TABLE `bookings`;
    TRUNCATE TABLE `area_assigned`;
    TRUNCATE TABLE `users`;
    TRUNCATE TABLE `areas`;
    TRUNCATE TABLE `districts`;
    TRUNCATE TABLE `states`;

    -- =========================================================================
    -- Step 1: Ensure Base State
    -- =========================================================================
    INSERT INTO `states` (`id`, `name`, `code`) VALUES
    (1, 'Kerala', 'KL')
    ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

    -- =========================================================================
    -- Step 2: Insert 14 Kerala Districts
    -- =========================================================================
    INSERT INTO `districts` (`id`, `state_id`, `name`, `code`) VALUES
    (1, 1, 'Thiruvananthapuram', 'dist-tvm'),
    (2, 1, 'Kollam', 'dist-klm'),
    (3, 1, 'Pathanamthitta', 'dist-pta'),
    (4, 1, 'Alappuzha', 'dist-alp'),
    (5, 1, 'Kottayam', 'dist-ktm'),
    (6, 1, 'Idukki', 'dist-idk'),
    (7, 1, 'Ernakulam', 'dist-ekm'),
    (8, 1, 'Thrissur', 'dist-tsr'),
    (9, 1, 'Palakkad', 'dist-pkd'),
    (10, 1, 'Malappuram', 'dist-mlp'),
    (11, 1, 'Kozhikode', 'dist-clt'),
    (12, 1, 'Wayanad', 'dist-wyd'),
    (13, 1, 'Kannur', 'dist-knr'),
    (14, 1, 'Kasaragod', 'dist-ksd');

    -- =========================================================================
    -- Step 3: Insert Comprehensive Areas Across All 14 Districts
    -- =========================================================================
    INSERT INTO `areas` (`id`, `district_id`, `name`, `pincode`) VALUES
    -- 1: Thiruvananthapuram
    (1, 1, 'Kowdiar', '695003'), (2, 1, 'Technopark', '695581'), (3, 1, 'Kazhakkoottam', '695582'),
    (4, 1, 'Pattom', '695004'), (5, 1, 'Vellayambalam', '695010'), (6, 1, 'Thampanoor', '695001'),
    (7, 1, 'Neyyattinkara', '695121'), (8, 1, 'Attingal', '695101'), (9, 1, 'Nedumangad', '695541'),
    (10, 1, 'Varkala', '695141'), (11, 1, 'Sreekaryam', '695017'), (12, 1, 'Nemom', '695020'),
    (13, 1, 'Peroorkada', '695005'), (14, 1, 'Poojappura', '695012'), (15, 1, 'Karamana', '695002'),
    -- 2: Kollam
    (16, 2, 'Chinnakada', '691001'), (17, 2, 'Kavanad', '691003'), (18, 2, 'Karunagappally', '690518'),
    (19, 2, 'Kottarakkara', '691506'), (20, 2, 'Punalur', '691305'), (21, 2, 'Paravur', '691301'),
    (22, 2, 'Sasthamkotta', '690521'), (23, 2, 'Kundara', '691501'), (24, 2, 'Chathannoor', '691572'),
    (25, 2, 'Anchal', '691306'), (26, 2, 'Pathanapuram', '691695'), (27, 2, 'Ayur', '691533'),
    -- 3: Pathanamthitta
    (28, 3, 'Central Pathanamthitta', '689645'), (29, 3, 'Adoor', '691523'), (30, 3, 'Thiruvalla', '689101'),
    (31, 3, 'Ranni', '689672'), (32, 3, 'Kozhencherry', '689641'), (33, 3, 'Konni', '689691'),
    (34, 3, 'Pandalam', '689501'), (35, 3, 'Mallappally', '689585'), (36, 3, 'Kumbanad', '689547'),
    -- 4: Alappuzha
    (37, 4, 'Boat Jetty Area', '688001'), (38, 4, 'Mullakkal', '688011'), (39, 4, 'Cherthala', '688524'),
    (40, 4, 'Kayamkulam', '690502'), (41, 4, 'Mavelikkara', '690101'), (42, 4, 'Chengannur', '689121'),
    (43, 4, 'Haripad', '690514'), (44, 4, 'Ambalapuzha', '688561'), (45, 4, 'Mararikulam', '688523'),
    (46, 4, 'Kuttanad', '688504'), (47, 4, 'Aroor', '688534'),
    -- 5: Kottayam
    (48, 5, 'Kottayam Town', '686001'), (49, 5, 'Kanjikuzhy', '686004'), (50, 5, 'Changanassery', '686101'),
    (51, 5, 'Pala', '686575'), (52, 5, 'Ettumanoor', '686631'), (53, 5, 'Vaikom', '686141'),
    (54, 5, 'Kanjirappally', '686507'), (55, 5, 'Erattupetta', '686121'), (56, 5, 'Pampady', '686502'),
    (57, 5, 'Manarcad', '686019'), (58, 5, 'Kuravilangad', '686633'),
    -- 6: Idukki
    (59, 6, 'Painavu', '685603'), (60, 6, 'Thodupuzha', '685584'), (61, 6, 'Kattappana', '685508'),
    (62, 6, 'Munnar', '685612'), (63, 6, 'Adimali', '685561'), (64, 6, 'Nedumkandam', '685553'),
    (65, 6, 'Kumily', '685509'), (66, 6, 'Peermade', '685531'), (67, 6, 'Vandiperiyar', '685533'),
    -- 7: Ernakulam
    (68, 7, 'Edapally', '682024'), (69, 7, 'Kakkanad', '682030'), (70, 7, 'Aluva', '683101'),
    (71, 7, 'Palarivattom', '682025'), (72, 7, 'Fort Kochi', '682001'), (73, 7, 'Vyttila', '682019'),
    (74, 7, 'Kaloor', '682017'), (75, 7, 'Tripunithura', '682301'), (76, 7, 'Kadavanthra', '682020'),
    (77, 7, 'Panampilly Nagar', '682036'), (78, 7, 'Marine Drive', '682031'), (79, 7, 'Ravipuram', '682016'),
    (80, 7, 'Thrikkakara', '682021'), (81, 7, 'Kalamassery', '683104'), (82, 7, 'Angamaly', '683572'),
    (83, 7, 'Perumbavoor', '683542'), (84, 7, 'Muvattupuzha', '686661'), (85, 7, 'Kothamangalam', '686691'),
    (86, 7, 'North Paravur', '683513'), (87, 7, 'Mattancherry', '682002'), (88, 7, 'Thevara', '682013'),
    (89, 7, 'Maradu', '682304'), (90, 7, 'Cherai', '683514'), (91, 7, 'Piravom', '686664'), (92, 7, 'Kolenchery', '682311'),
    -- 8: Thrissur
    (93, 8, 'Round North', '680001'), (94, 8, 'Punkunnam', '680002'), (95, 8, 'Ayyanthole', '680003'),
    (96, 8, 'Ollur', '680306'), (97, 8, 'Chalakudy', '680307'), (98, 8, 'Kodungallur', '680664'),
    (99, 8, 'Kunnamkulam', '680503'), (100, 8, 'Guruvayur', '680101'), (101, 8, 'Irinjalakuda', '680121'),
    (102, 8, 'Wadakkanchery', '680582'), (103, 8, 'Mannuthy', '680651'), (104, 8, 'Chavakkad', '680506'),
    -- 9: Palakkad
    (105, 9, 'Palakkad Town', '678001'), (106, 9, 'Ottapalam', '679101'), (107, 9, 'Shoranur', '679121'),
    (108, 9, 'Chittur', '678101'), (109, 9, 'Mannarkkad', '678582'), (110, 9, 'Alathur', '678541'),
    (111, 9, 'Pattambi', '679303'), (112, 9, 'Cherpulassery', '679503'), (113, 9, 'Vadakkencherry', '678683'),
    -- 10: Malappuram
    (114, 10, 'Malappuram Town', '676505'), (115, 10, 'Manjeri', '676121'), (116, 10, 'Perinthalmanna', '679322'),
    (117, 10, 'Tirur', '676101'), (118, 10, 'Ponnani', '679577'), (119, 10, 'Kottakkal', '676503'),
    (120, 10, 'Nilambur', '679329'), (121, 10, 'Kondotty', '673638'), (122, 10, 'Valanchery', '676552'),
    (123, 10, 'Tanur', '676302'), (124, 10, 'Parappanangadi', '676303'),
    -- 11: Kozhikode
    (125, 11, 'Mavoor Road', '673004'), (126, 11, 'Palayam', '673001'), (127, 11, 'Mananchira', '673001'),
    (128, 11, 'Chevayur', '673017'), (129, 11, 'Medical College', '673008'), (130, 11, 'Vadakara', '673101'),
    (131, 11, 'Koyilandy', '673305'), (132, 11, 'Ramanattukara', '673633'), (133, 11, 'Feroke', '673631'),
    (134, 11, 'Thamarassery', '673573'), (135, 11, 'Balussery', '673612'), (136, 11, 'Koduvally', '673572'),
    -- 12: Wayanad
    (137, 12, 'Kalpetta', '673121'), (138, 12, 'Sulthan Bathery', '673592'), (139, 12, 'Mananthavady', '670645'),
    (140, 12, 'Meppadi', '673577'), (141, 12, 'Vythiri', '673576'), (142, 12, 'Panamaram', '670721'),
    (143, 12, 'Ambalavayal', '673593'), (144, 12, 'Pulpally', '673579'),
    -- 13: Kannur
    (145, 13, 'Thana', '670012'), (146, 13, 'Payyambalam', '670001'), (147, 13, 'South Bazar', '670002'),
    (148, 13, 'Talap', '670002'), (149, 13, 'Payyanur', '670307'), (150, 13, 'Thalassery', '670101'),
    (151, 13, 'Mattannur', '670702'), (152, 13, 'Iritty', '670703'), (153, 13, 'Taliparamba', '670141'),
    (154, 13, 'Kuthuparamba', '670643'), (155, 13, 'Chakkarakkal', '670613'),
    -- 14: Kasaragod
    (156, 14, 'Kasaragod Town', '671121'), (157, 14, 'Kanhangad', '671315'), (158, 14, 'Nileshwaram', '671314'),
    (159, 14, 'Uppala', '671322'), (160, 14, 'Manjeshwar', '671323'), (161, 14, 'Cheruvathur', '671313'),
    (162, 14, 'Bekal', '671318'), (163, 14, 'Kumbla', '671321');

    -- =========================================================================
    -- Step 4: Insert Users (Branch Heads, Company, Coordinators, Dealers)
    -- =========================================================================

    -- 4a. 14 Branch Heads (IDs 1..14)
    INSERT INTO `users` (
        `id`, `username`, `password`, `role_id`, `role`, `user_type_id`, `user_type`,
        `name`, `email`, `phone`, `state_id`, `state_name`, `district_id`, `district_name`, `is_active`
    )
    SELECT 
        d.id,
        CONCAT('bh_', LOWER(REPLACE(d.name, ' ', '_'))),
        '123',
        3,
        'branch_head',
        2,
        'staff',
        CONCAT('Branch Head - ', d.name),
        CONCAT('bh.', LOWER(REPLACE(d.name, ' ', '')), '@steeldoor.com'),
        CONCAT('+91 9400', LPAD(d.id, 6, '0')),
        1,
        'Kerala',
        d.id,
        d.name,
        1
    FROM `districts` d;

    -- 4b. 5 Company Logins (IDs 15..19)
    INSERT INTO `users` (
        `id`, `username`, `password`, `role_id`, `role`, `user_type_id`, `user_type`,
        `name`, `email`, `phone`, `state_id`, `state_name`, `district_id`, `district_name`, `is_active`
    )
    SELECT
        14 + seq.n,
        CONCAT('company_admin_', seq.n),
        '123',
        1,
        'company',
        1,
        'admin',
        CONCAT('Company Executive ', seq.n),
        CONCAT('corp', seq.n, '@steeldoor.com'),
        CONCAT('+91 9800', LPAD(seq.n, 6, '0')),
        1,
        'Kerala',
        NULL,
        NULL,
        1
    FROM (
        SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
    ) seq;

    -- 4c. 10 Coordinator Logins (IDs 20..29)
    INSERT INTO `users` (
        `id`, `username`, `password`, `role_id`, `role`, `user_type_id`, `user_type`,
        `name`, `email`, `phone`, `state_id`, `state_name`, `district_id`, `district_name`, `is_active`
    )
    SELECT
        19 + seq.n,
        CONCAT('coord_', seq.n),
        '123',
        2,
        'coordinator',
        2,
        'staff',
        CONCAT('Coordinator Officer ', seq.n),
        CONCAT('coord', seq.n, '@steeldoor.com'),
        CONCAT('+91 9700', LPAD(seq.n, 6, '0')),
        1,
        'Kerala',
        NULL,
        NULL,
        1
    FROM (
        SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
        UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
    ) seq;

    -- 4d. Dynamic Dealers (IDs 30 .. 29 + p_count)
    INSERT INTO `users` (
        `id`, `username`, `password`, `role_id`, `role`, `user_type_id`, `user_type`,
        `name`, `email`, `phone`, `state_id`, `state_name`, `district_id`, `district_name`, `address`, `is_active`
    )
    SELECT
        29 + seq.n,
        CONCAT('dealer_', seq.n),
        '123',
        4,
        'dealer',
        NULL,
        NULL,
        CONCAT('Steel Doors Dealer ', seq.n),
        CONCAT('dealer', seq.n, '@steeldoornetwork.in'),
        CONCAT('+91 91', LPAD(seq.n, 8, '0')),
        1,
        'Kerala',
        NULL,
        NULL,
        CONCAT('Commercial Showroom Shop No. ', seq.n, ', Kerala'),
        1
    FROM (
        SELECT (u1.n + u10.n * 10 + u100.n * 100 + u1000.n * 1000 + 1) AS n
        FROM (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) u1
        CROSS JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) u10
        CROSS JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) u100
        CROSS JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) u1000
    ) seq
    WHERE seq.n <= p_count;

    -- =========================================================================
    -- Step 5: Assign All Areas to Respective District Branch Heads
    -- =========================================================================
    INSERT INTO `area_assigned` (`user_id`, `user_name`, `district_id`, `district_name`, `area_id`, `area_name`, `area_pincode`)
    SELECT 
        bh.id AS `user_id`,
        bh.name AS `user_name`,
        d.id AS `district_id`,
        d.name AS `district_name`,
        a.id AS `area_id`,
        a.name AS `area_name`,
        a.pincode AS `area_pincode`
    FROM `areas` a
    JOIN `districts` d ON d.id = a.district_id
    JOIN `users` bh ON bh.role_id = 3 AND bh.district_id = d.id;

    -- =========================================================================
    -- Step 6: Insert Exactly p_count Bookings
    -- =========================================================================
    INSERT INTO `bookings` (
        `id`, `name`, `mobile`, `address`, `notes`, `staff_notes`,
        `status_id`, `status_code`, `status_label`, `status_color_code`, `status_is_followup`,
        `schedule_date`, `state_id`, `state_name`,
        `district_id`, `district_name`, `area_id`, `area_name`,
        `assigned_head_district_id`, `assigned_head_district_name`,
        `assigned_head_area_id`, `assigned_head_area_name`,
        `branch_head_id`, `branch_head_name`,
        `documents`, `is_deleted`,
        `login_role_id`, `login_id`, `login_name`,
        `created_at`, `updated_at`
    )
    SELECT
        b.booking_num AS `id`,
        CONCAT(
            ELT(1 + (b.booking_num % 10), 'Rahul', 'Ananya', 'Vishnu', 'Sneha', 'Fahad', 'Gopika', 'Arjun', 'Meera', 'Rinshad', 'Devika'),
            ' ',
            ELT(1 + ((b.booking_num >> 2) % 10), 'Nair', 'Menon', 'Pillai', 'Varghese', 'Kurian', 'Nambiar', 'Sreedharan', 'Mathew', 'Panicker', 'Kabeer')
        ) AS `name`,
        CONCAT('+91 98', LPAD(b.booking_num, 8, '0')) AS `mobile`,
        CONCAT('House No. ', 10 + (b.booking_num % 400), ', Ward ', 1 + (b.booking_num % 25), ', ', ar.name, ', Kerala') AS `address`,
        'Customer requested premium steel door site measurement.' AS `notes`,
        CASE WHEN (b.booking_num % 4) IN (1, 2) THEN 'Assigned to field technician for installation.' ELSE NULL END AS `staff_notes`,
        
        st.id AS `status_id`,
        st.code AS `status_code`,
        st.label AS `status_label`,
        st.color_code AS `status_color_code`,
        st.is_followup AS `status_is_followup`,
        
        CASE 
            WHEN st.is_date = 1 THEN DATE_ADD('2026-10-01', INTERVAL (b.booking_num % 45) DAY)
            ELSE NULL
        END AS `schedule_date`,
        
        1 AS `state_id`,
        'Kerala' AS `state_name`,
        
        dt.id AS `district_id`,
        dt.name AS `district_name`,
        ar.id AS `area_id`,
        ar.name AS `area_name`,
        
        dt.id AS `assigned_head_district_id`,
        dt.name AS `assigned_head_district_name`,
        ar.id AS `assigned_head_area_id`,
        ar.name AS `assigned_head_area_name`,
        bh.id AS `branch_head_id`,
        bh.name AS `branch_head_name`,
        
        '[]' AS `documents`,
        0 AS `is_deleted`,
        
        4 AS `login_role_id`,
        (29 + b.booking_num) AS `login_id`,
        CONCAT('Steel Doors Dealer ', b.booking_num) AS `login_name`,
        
        DATE_ADD('2026-09-01 09:00:00', INTERVAL (b.booking_num * 8) MINUTE) AS `created_at`,
        DATE_ADD('2026-09-01 09:30:00', INTERVAL (b.booking_num * 8) MINUTE) AS `updated_at`

    FROM (
        SELECT (u1.n + u10.n * 10 + u100.n * 100 + u1000.n * 1000 + 1) AS booking_num
        FROM (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) u1
        CROSS JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) u10
        CROSS JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) u100
        CROSS JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) u1000
    ) b
    JOIN `districts` dt ON dt.id = (1 + (b.booking_num % 14))
    JOIN `users` bh ON bh.role_id = 3 AND bh.district_id = dt.id
    JOIN `status_options` st ON st.id = (1 + (b.booking_num % (SELECT COUNT(*) FROM `status_options` WHERE `is_active` = 1)))
    JOIN (
        SELECT a.id, a.name, a.district_id,
               ROW_NUMBER() OVER (PARTITION BY a.district_id ORDER BY a.id) AS row_n,
               COUNT(*) OVER (PARTITION BY a.district_id) AS total_in_dist
        FROM `areas` a
    ) ar ON ar.district_id = dt.id AND ar.row_n = (1 + (b.booking_num % ar.total_in_dist))
    WHERE b.booking_num <= p_count;

    -- =========================================================================
    -- Step 7: Insert Booking History with ALL UI Action Types (IDs 1 to 7)
    -- =========================================================================

    -- 7a. Action 1: 'NEW_BOOKING_CREATED' ('New Booking Created') (All Bookings)
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type_id`, `action_type`, `action_type_color_code`,
        `customer_note`, `staff_note`,
        `new_status_id`, `new_status_code`, `new_status_label`, `new_status_color_code`,
        `to_assigned_head_district_id`, `to_assigned_head_district_name`,
        `to_assigned_head_area_id`, `to_assigned_head_area_name`,
        `to_branch_head_id`, `to_branch_head_name`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        1, 'New Booking Created', '#2563eb',
        bk.notes,
        NULL,
        1, 'New', 'New', '#3b82f6',
        bk.assigned_head_district_id, bk.assigned_head_district_name,
        bk.assigned_head_area_id, bk.assigned_head_area_name,
        bk.branch_head_id, bk.branch_head_name,
        bk.login_id, bk.login_name, bk.login_role_id,
        bk.created_at
    FROM `bookings` bk;

    -- 7b. Action 2: 'STATUS_UPDATED' ('Status Updated') (For bookings with status_id > 1)
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type_id`, `action_type`, `action_type_color_code`,
        `customer_note`, `staff_note`,
        `old_status_id`, `old_status_code`, `old_status_label`, `old_status_color_code`,
        `new_status_id`, `new_status_code`, `new_status_label`, `new_status_color_code`,
        `old_schedule_date`, `new_schedule_date`,
        `from_branch_head_id`, `from_branch_head_name`,
        `to_branch_head_id`, `to_branch_head_name`,
        `from_assigned_head_district_id`, `from_assigned_head_district_name`,
        `to_assigned_head_district_id`, `to_assigned_head_district_name`,
        `from_assigned_head_area_id`, `from_assigned_head_area_name`,
        `to_assigned_head_area_id`, `to_assigned_head_area_name`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        2, 'Status Updated', '#059669',
        bk.notes,
        bk.staff_notes,
        1, 'New', 'New', '#3b82f6',
        bk.status_id, bk.status_code, bk.status_label, bk.status_color_code,
        NULL, bk.schedule_date,
        bk.branch_head_id, bk.branch_head_name,
        bk.branch_head_id, bk.branch_head_name,
        bk.assigned_head_district_id, bk.assigned_head_district_name,
        bk.assigned_head_district_id, bk.assigned_head_district_name,
        bk.assigned_head_area_id, bk.assigned_head_area_name,
        bk.assigned_head_area_id, bk.assigned_head_area_name,
        bk.branch_head_id, bk.branch_head_name, 3,
        DATE_ADD(bk.created_at, INTERVAL 20 MINUTE)
    FROM `bookings` bk
    WHERE bk.status_id > 1;

    -- 7c. Action 3: 'TRANSFERED' ('Transfered') (Area & Branch Head reassignment)
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type_id`, `action_type`, `action_type_color_code`,
        `staff_note`,
        `from_assigned_head_district_id`, `from_assigned_head_district_name`,
        `to_assigned_head_district_id`, `to_assigned_head_district_name`,
        `from_assigned_head_area_id`, `from_assigned_head_area_name`,
        `to_assigned_head_area_id`, `to_assigned_head_area_name`,
        `from_branch_head_id`, `from_branch_head_name`,
        `to_branch_head_id`, `to_branch_head_name`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        3, 'Transfered', '#b45309',
        'Area transferred to adjacent Branch Head hub for faster fulfillment.',
        bk.assigned_head_district_id, bk.assigned_head_district_name,
        next_dt.id, next_dt.name,
        bk.assigned_head_area_id, bk.assigned_head_area_name,
        next_ar.id, next_ar.name,
        bk.branch_head_id, bk.branch_head_name,
        next_bh.id, next_bh.name,
        15, 'Company Executive 1', 1,
        DATE_ADD(bk.created_at, INTERVAL 65 MINUTE)
    FROM `bookings` bk
    JOIN `districts` next_dt ON next_dt.id = (1 + ((bk.district_id) % 14))
    JOIN `users` next_bh ON next_bh.role_id = 3 AND next_bh.district_id = next_dt.id
    JOIN `areas` next_ar ON next_ar.district_id = next_dt.id
    WHERE (bk.id % 8) = 0
    GROUP BY bk.id;

    -- 7d. Action 4: 'SCHEDULED_DATE_CHANGED' ('Scheduled Date Changed')
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type_id`, `action_type`, `action_type_color_code`,
        `staff_note`,
        `old_schedule_date`, `new_schedule_date`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        4, 'Scheduled Date Changed', '#7c3aed',
        'Customer requested rescheduling due to ongoing flooring work.',
        bk.schedule_date,
        DATE_ADD(bk.schedule_date, INTERVAL 5 DAY),
        bk.branch_head_id, bk.branch_head_name, 3,
        DATE_ADD(bk.created_at, INTERVAL 55 MINUTE)
    FROM `bookings` bk
    WHERE bk.schedule_date IS NOT NULL AND (bk.id % 6) = 0;

    -- 7e. Action 5: 'CUSTOMER_NAME_UPDATED' ('Customer Name Updated')
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type_id`, `action_type`, `action_type_color_code`,
        `customer_note`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        5, 'Customer Name Updated', '#0284c7',
        'Customer clarified spelling of their family name.',
        20, 'Coordinator Officer 1', 2,
        DATE_ADD(bk.created_at, INTERVAL 35 MINUTE)
    FROM `bookings` bk
    WHERE (bk.id % 5) = 0;

    -- 7f. Action 6: 'CUSTOMER_NOTES_UPDATED' ('Customer Notes Updated')
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type_id`, `action_type`, `action_type_color_code`,
        `customer_note`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        6, 'Customer Notes Updated', '#475569',
        'Added gate entry code and security guard contact instructions.',
        20, 'Coordinator Officer 1', 2,
        DATE_ADD(bk.created_at, INTERVAL 45 MINUTE)
    FROM `bookings` bk
    WHERE (bk.id % 7) = 0;

    SET FOREIGN_KEY_CHECKS = 1;

    -- =========================================================================
    -- Final Status Report
    -- =========================================================================
    SELECT 
        (SELECT COUNT(*) FROM `districts`) AS total_districts,
        (SELECT COUNT(*) FROM `areas`) AS total_areas,
        (SELECT COUNT(*) FROM `area_assigned`) AS total_area_assigned,
        (SELECT COUNT(*) FROM `users`) AS total_users,
        (SELECT COUNT(*) FROM `bookings`) AS total_bookings,
        (SELECT COUNT(*) FROM `booking_history`) AS total_booking_histories;

END proc_label$$
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_booking_status_or_branch_head`(
    IN p_booking_id                  INT,          -- 1. Booking ID to update
    IN p_status_id                   INT,          -- 2. New status ID (e.g. 1, 2, 3, 4; or NULL to keep current)
    IN p_schedule_date               DATE,         -- 3. Scheduled appointment date (or NULL)
    IN p_staff_notes                 TEXT,         -- 4. Status note / transfer remarks
    IN p_action_by_id                INT,          -- 5. User ID performing the action
    IN p_action_by_name              VARCHAR(150), -- 6. User Name performing the action
    IN p_action_by_role_id           INT,          -- 7. User Role ID performing the action
    IN p_branch_head_id              INT,          -- 8. Selected Branch Head ID
    IN p_branch_head_name            VARCHAR(150), -- 9. Selected Branch Head Name
    IN p_assigned_head_district_id   INT,          -- 10. Selected Branch Head District ID
    IN p_assigned_head_district_name VARCHAR(100), -- 11. Selected Branch Head District Name
    IN p_assigned_head_area_id       INT,          -- 12. Selected Area ID
    IN p_assigned_head_area_name     VARCHAR(100)  -- 13. Selected Area Name
)
BEGIN
    DECLARE v_booking_name VARCHAR(150);
    DECLARE v_action_by_name VARCHAR(150);

    -- Old booking values
    DECLARE v_old_status_id INT;
    DECLARE v_old_status_code VARCHAR(50);
    DECLARE v_old_status_label VARCHAR(100);
    DECLARE v_old_status_color_code VARCHAR(20);
    DECLARE v_old_schedule_date DATE;
    DECLARE v_old_branch_head_id INT;
    DECLARE v_old_branch_head_name VARCHAR(150);
    DECLARE v_old_assigned_head_district_id INT;
    DECLARE v_old_assigned_head_district_name VARCHAR(100);
    DECLARE v_old_assigned_head_area_id INT;
    DECLARE v_old_assigned_head_area_name VARCHAR(100);

    -- New status values
    DECLARE v_new_status_id INT;
    DECLARE v_new_status_code VARCHAR(50);
    DECLARE v_new_status_label VARCHAR(100);
    DECLARE v_new_status_color_code VARCHAR(20);
    DECLARE v_new_status_is_followup TINYINT(1) DEFAULT 0;
    DECLARE v_new_status_is_date TINYINT(1) DEFAULT 0;
    DECLARE v_clean_schedule_date DATE;

    -- Target assignment values
    DECLARE v_target_branch_head_id INT;
    DECLARE v_target_branch_head_name VARCHAR(150);
    DECLARE v_target_district_id INT;
    DECLARE v_target_district_name VARCHAR(100);
    DECLARE v_target_area_id INT;
    DECLARE v_target_area_name VARCHAR(100);

    -- 1. Initialize action user name (zero DB query needed)
    SET v_action_by_name = TRIM(p_action_by_name);

    -- 2. Fetch current booking values
    SELECT 
        name,
        status_id, status_code, status_label, status_color_code,
        schedule_date,
        branch_head_id, branch_head_name,
        assigned_head_district_id, assigned_head_district_name,
        assigned_head_area_id, assigned_head_area_name
    INTO 
        v_booking_name,
        v_old_status_id, v_old_status_code, v_old_status_label, v_old_status_color_code,
        v_old_schedule_date,
        v_old_branch_head_id, v_old_branch_head_name,
        v_old_assigned_head_district_id, v_old_assigned_head_district_name,
        v_old_assigned_head_area_id, v_old_assigned_head_area_name
    FROM bookings 
    WHERE id = p_booking_id AND is_deleted = 0
    LIMIT 1;

    -- 3. Resolve New Status details from status_options table
    IF p_status_id IS NOT NULL AND p_status_id > 0 THEN
        SELECT 
            id, code, label, color_code, is_followup, is_date
        INTO 
            v_new_status_id, v_new_status_code, v_new_status_label, v_new_status_color_code, v_new_status_is_followup, v_new_status_is_date
        FROM status_options 
        WHERE id = p_status_id 
        LIMIT 1;
    ELSE
        -- Keep existing status if p_status_id was not provided
        SET v_new_status_id = v_old_status_id;
        SET v_new_status_code = v_old_status_code;
        SET v_new_status_label = v_old_status_label;
        SET v_new_status_color_code = v_old_status_color_code;
    END IF;

    -- 4. Sanitize Schedule Date using the is_date flag from status_options
    IF v_new_status_is_date = 1 THEN
        SET v_clean_schedule_date = COALESCE(p_schedule_date, v_old_schedule_date);
    ELSE
        SET v_clean_schedule_date = NULL;
    END IF;

    -- 5. Determine Target Assignment (Branch Head, District, Area)
    SET v_target_branch_head_id = COALESCE(p_branch_head_id, v_old_branch_head_id);
    SET v_target_branch_head_name = COALESCE(TRIM(p_branch_head_name), v_old_branch_head_name);
    SET v_target_district_id = COALESCE(p_assigned_head_district_id, v_old_assigned_head_district_id);
    SET v_target_district_name = COALESCE(TRIM(p_assigned_head_district_name), v_old_assigned_head_district_name);
    SET v_target_area_id = COALESCE(p_assigned_head_area_id, v_old_assigned_head_area_id);
    SET v_target_area_name = COALESCE(TRIM(p_assigned_head_area_name), v_old_assigned_head_area_name);

    -- 6. Insert History Log: Branch Head / Area Assignment or Transfer
	IF p_assigned_head_area_id IS NOT NULL 
		AND (v_old_assigned_head_area_id IS NULL OR v_old_assigned_head_area_id <> p_assigned_head_area_id) THEN
        INSERT INTO booking_history (
            booking_id, booking_name, 
            action_type_id, action_type, action_type_color_code, staff_note,
            from_branch_head_id, from_branch_head_name,
            to_branch_head_id, to_branch_head_name,
            from_assigned_head_district_id, from_assigned_head_district_name,
            to_assigned_head_district_id, to_assigned_head_district_name,
            from_assigned_head_area_id, from_assigned_head_area_name,
            to_assigned_head_area_id, to_assigned_head_area_name,
            action_by_id, action_by_name, action_by_role_id
        ) VALUES (
            p_booking_id, v_booking_name, 
            3, 'Transfered', '#b45309',
            NULLIF(TRIM(p_staff_notes), ''),
            v_old_branch_head_id, v_old_branch_head_name,
            v_target_branch_head_id, v_target_branch_head_name,
            v_old_assigned_head_district_id, v_old_assigned_head_district_name,
            v_target_district_id, v_target_district_name,
            v_old_assigned_head_area_id, v_old_assigned_head_area_name,
            v_target_area_id, v_target_area_name,
            p_action_by_id, v_action_by_name, p_action_by_role_id
        );
    END IF;

    -- 7. Insert History Log: Status Change
    IF v_new_status_id IS NOT NULL AND (v_old_status_id IS NULL OR v_old_status_id <> v_new_status_id) THEN
        INSERT INTO booking_history (
            booking_id, booking_name, 
            action_type_id, action_type, action_type_color_code, staff_note,
            old_status_id, old_status_code, old_status_label, old_status_color_code,
            new_status_id, new_status_code, new_status_label, new_status_color_code,
            old_schedule_date, new_schedule_date,
            action_by_id, action_by_name, action_by_role_id
        ) VALUES (
            p_booking_id, v_booking_name, 
            2, 'Status Updated', '#059669', 
            NULLIF(TRIM(p_staff_notes), ''),
            v_old_status_id, v_old_status_code, v_old_status_label, v_old_status_color_code,
            v_new_status_id, v_new_status_code, v_new_status_label, v_new_status_color_code,
            v_old_schedule_date, v_clean_schedule_date,
            p_action_by_id, v_action_by_name, p_action_by_role_id
        );
    -- 8. Insert History Log: Schedule Date Modified (Status remained same)
    ELSEIF v_new_status_is_date = 1 
       AND v_clean_schedule_date IS NOT NULL 
       AND (v_old_schedule_date IS NULL OR v_old_schedule_date <> v_clean_schedule_date) THEN
        INSERT INTO booking_history (
            booking_id, booking_name, 
            action_type_id, action_type, action_type_color_code, staff_note,
            old_status_id, old_status_code, old_status_label, old_status_color_code,
            new_status_id, new_status_code, new_status_label, new_status_color_code,
            old_schedule_date, new_schedule_date,
            action_by_id, action_by_name, action_by_role_id
        ) VALUES (
            p_booking_id, v_booking_name, 
            4, 'Scheduled Date Changed', '#7c3aed', 
            NULLIF(TRIM(p_staff_notes), ''),
            v_old_status_id, v_old_status_code, v_old_status_label, v_old_status_color_code,
            v_new_status_id, v_new_status_code, v_new_status_label, v_new_status_color_code,
            v_old_schedule_date, v_clean_schedule_date,
            p_action_by_id, v_action_by_name, p_action_by_role_id
        );
    END IF;
    -- 9. Update bookings table
    UPDATE bookings
    SET 
        status_id                   = v_new_status_id,
        status_code                 = v_new_status_code,
        status_label                = v_new_status_label,
        status_color_code           = v_new_status_color_code,
        status_is_followup          = v_new_status_is_followup,
        schedule_date               = v_clean_schedule_date,
        staff_notes                 = CASE WHEN p_staff_notes IS NOT NULL AND TRIM(p_staff_notes) != '' THEN TRIM(p_staff_notes) ELSE staff_notes END,
        branch_head_id              = v_target_branch_head_id,
        branch_head_name            = v_target_branch_head_name,
        assigned_head_district_id   = v_target_district_id,
        assigned_head_district_name = v_target_district_name,
        assigned_head_area_id       = v_target_area_id,
        assigned_head_area_name     = v_target_area_name,
        updated_at                  = CURRENT_TIMESTAMP
    WHERE id = p_booking_id AND is_deleted = 0;
    -- 10. Return updated booking record
    SELECT 
        b.id,
        b.id AS client_id,
        b.name AS client_name,
        b.status_id,
        b.status_code,
        b.status_label AS status,
        b.status_color_code,
        b.status_is_followup,
        b.schedule_date,
        b.notes,
        b.staff_notes,
        b.assigned_head_district_id,
        b.assigned_head_district_name,
        b.assigned_head_area_id,
        b.assigned_head_area_name,
        b.branch_head_id,
        b.branch_head_name,
        b.login_id AS created_by,
        b.login_name AS created_by_name,
        b.updated_at
    FROM bookings b
    WHERE b.id = p_booking_id AND b.is_deleted = 0;

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
