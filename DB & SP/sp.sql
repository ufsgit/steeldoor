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
    IN p_district_id INT,           -- User district ID / filter district ID
    IN p_status_id   INT,           -- Filter by status_id (e.g. 1: New, 2: Scheduled, etc.)
    IN p_search      VARCHAR(150),  -- Search client name or phone/mobile
    IN p_date_from   DATE,          -- Filter created date from
    IN p_date_to     DATE,          -- Filter created date to
    IN p_filter_role INT            -- Filter by customer login_role_id (1: company, 2: coordinator, 3: branch_head, 4: dealer, 5: customer)
)
BEGIN
    DECLARE v_limit INT DEFAULT 15;
    DECLARE v_page INT DEFAULT 1;
    DECLARE v_offset INT DEFAULT 0;
    DECLARE v_district_id INT DEFAULT NULL;
    DECLARE v_search VARCHAR(160) DEFAULT NULL;


    -- Apply default limit 15 if null or <= 0
    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    -- Apply default page 1 if null or <= 0
    IF p_page IS NOT NULL AND p_page > 0 THEN
        SET v_page = p_page;
    END IF;

    SET v_offset = (v_page - 1) * v_limit;
    SET v_district_id = p_district_id;

    -- If Role 3 (Branch Head) and district_id was not provided, resolve from users table
    IF p_role_id = 3 AND (v_district_id IS NULL OR v_district_id <= 0) AND p_login_id IS NOT NULL THEN
        SELECT district_id INTO v_district_id
        FROM users
        WHERE id = p_login_id AND is_deleted = 0
        LIMIT 1;
    END IF;

    -- Format search term
    IF p_search IS NOT NULL AND TRIM(p_search) != '' THEN
        SET v_search = CONCAT('%', TRIM(p_search), '%');
    END IF;

    -- Query 1: Fetch paginated bookings matching role rules & search/filter parameters
    SELECT 
        id,
        name,
        mobile,
        address,
        notes,
        staff_notes,
        status_id,
        status_code,
        status_label,
        status_color_code,
        schedule_date,
        login_role_id,
        login_id,
        login_name,
        state_id,
        state_name,
        district_id,
        district_name,
        area_id,
        area_name,
		assigned_head_district_id,
        assigned_head_district_name,
        branch_head_id,
        branch_head_name,
        documents,
        created_at,
        updated_at
    FROM bookings
    WHERE is_deleted = 0
      -- Role Scoping
      AND (
          -- Role 1 (company) & Role 2 (coordinator): list ALL clients
          (p_role_id IN (1, 2) OR p_role_id IS NULL)
          
          -- Role 3 (branch_head): filter strictly by assigned_head_district_id
          OR (p_role_id = 3 AND assigned_head_district_id = v_district_id)

          -- Role 4 (dealer) & Role 5 (customer): take list by login_id
          OR (p_role_id NOT IN (1, 2, 3) AND login_id = p_login_id)
      )
      -- Optional District Filter
      AND (
          v_district_id IS NULL 
          OR v_district_id <= 0 
          OR district_id = v_district_id
          OR (p_role_id = 3) -- branch head scoping already handles district above
      )
      -- Search Client Name or Mobile / Phone Number
      AND (
          v_search IS NULL 
          OR name LIKE v_search 
          OR mobile LIKE v_search
      )
		-- Status Filter by status_id
      AND (
          p_status_id IS NULL 
          OR p_status_id <= 0 
          OR status_id = p_status_id
      )
      -- Date Range Filter
      AND (p_date_from IS NULL OR DATE(created_at) >= p_date_from)
      AND (p_date_to IS NULL OR DATE(created_at) <= p_date_to)
      -- Customer Dropdown Filter by login_role_id:
      -- 1: company, 2: coordinator, 3: branch_head, 4: dealer, 5: customer
      AND (
          p_filter_role IS NULL 
          OR p_filter_role <= 0 
          OR login_role_id = p_filter_role
      )
    ORDER BY created_at DESC
    LIMIT v_limit OFFSET v_offset;

    -- Query 2: Pagination metadata matching the exact same filters
    SELECT 
        COUNT(*) AS total_records,
        v_page AS current_page,
        v_limit AS page_size,
        CEIL(COUNT(*) / v_limit) AS total_pages
    FROM bookings
    WHERE is_deleted = 0
      AND (
          (p_role_id IN (1, 2) OR p_role_id IS NULL)
          OR (p_role_id = 3 AND (branch_head_id = p_login_id OR (branch_head_id IS NULL AND assigned_head_district_id = v_district_id)))
          OR (p_role_id NOT IN (1, 2, 3) AND login_id = p_login_id)
      )
      AND (
          v_district_id IS NULL 
          OR v_district_id <= 0 
          OR district_id = v_district_id
          OR (p_role_id = 3)
      )
      AND (
          v_search IS NULL 
          OR name LIKE v_search 
          OR mobile LIKE v_search
      )
      AND (
          p_status_id IS NULL 
          OR p_status_id <= 0 
          OR status_id = p_status_id
      )
      AND (p_date_from IS NULL OR DATE(created_at) >= p_date_from)
      AND (p_date_to IS NULL OR DATE(created_at) <= p_date_to)
      AND (
          p_filter_role IS NULL 
          OR p_filter_role <= 0 
          OR login_role_id = p_filter_role
      );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_booking_history`(
    IN p_search VARCHAR(150),
    IN p_action_filter VARCHAR(100),
    IN p_from_date DATE,
    IN p_to_date DATE,
    IN p_page INT,
    IN p_limit INT,
	IN p_user_id INT,
    IN p_role_id INT
)
BEGIN
    DECLARE v_offset INT DEFAULT 0;
    DECLARE v_from_date DATE;
    DECLARE v_to_date DATE;

    -- Handle pagination defaults
    IF p_page IS NULL OR p_page < 1 THEN
        SET p_page = 1;
    END IF;
    
    IF p_limit IS NULL OR p_limit < 1 THEN
        SET p_limit = 20;
    END IF;

    SET v_offset = (p_page - 1) * p_limit;

    -- Date logic: if from/to are not passed, default to TODAY
    IF p_from_date IS NULL AND p_to_date IS NULL THEN
        SET v_from_date = CURDATE();
        SET v_to_date = CURDATE();
    ELSE
        SET v_from_date = COALESCE(p_from_date, p_to_date);
        SET v_to_date = COALESCE(p_to_date, p_from_date);
    END IF;

    -- Main query with search, filter, date range & pagination
    SELECT 
        bh.*
    FROM `booking_history` bh
    WHERE 
        -- Date range filter
        DATE(bh.created_at) BETWEEN v_from_date AND v_to_date

        -- Booking name prefix search
        AND (
            p_search IS NULL 
            OR TRIM(p_search) = '' 
            OR bh.booking_name LIKE CONCAT(TRIM(p_search), '%')
        )

        -- Action type category filter
        AND (
            p_action_filter IS NULL 
            OR TRIM(p_action_filter) = '' 
            OR p_action_filter = 'ALL'
            OR (p_action_filter = 'Customer Name Updated' AND bh.action_type LIKE 'Customer Name Updated%')
            OR (p_action_filter = 'Scheduled Date Changed' AND bh.action_type LIKE 'Scheduled Date Changed%')
            OR bh.action_type = p_action_filter
        )
                -- Role-based restriction: role 1 & 2 see all, role 3 sees only their own actions, other roles/null see nothing
        AND (
            (p_role_id IN (1, 2))
            OR (p_role_id = 3 AND bh.action_by_id = p_user_id)
        )
    ORDER BY bh.created_at DESC, bh.history_id DESC
    LIMIT p_limit OFFSET v_offset;

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_branch_heads_for_status_update`()
BEGIN
    SELECT 
        u.id,
        u.name,
        d.id   AS district_id,
        d.name AS district_name
    FROM users u
    INNER JOIN districts d ON u.district_id = d.id
    WHERE u.role_id = 3                          -- Branch Head role
      AND u.is_active = 1                        -- is_active = 1
      AND u.is_deleted = 0                       -- is_deleted = 0
    ORDER BY u.name ASC;
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
        is_active AS isActive
    FROM status_options
    WHERE is_active = 1
    ORDER BY sort_order ASC, id ASC;
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
        -- Optionally resolve from status_options table if available
        SELECT id, code, label, color_code 
        INTO v_status_id, v_status_code, v_status_label, v_status_color_code
        FROM status_options 
        WHERE id = 1 LIMIT 1;

        INSERT INTO bookings (
            name, mobile, address, notes,
            status_id, status_code, status_label, status_color_code,
            login_role_id, login_id, login_name,
            state_id, state_name, district_id, district_name,
            area_id, area_name, assigned_head_district_id, assigned_head_district_name, branch_head_id, branch_head_name,
            documents
        ) VALUES (
            p_name, p_mobile, p_address, p_notes,
            v_status_id, v_status_code, v_status_label, v_status_color_code,
            p_login_role_id, p_login_id, p_login_name,
            p_state_id, v_state_name, p_district_id, v_district_name,
            p_area_id, v_area_name, p_district_id, v_district_name, v_branch_head_id, v_branch_head_name,
            p_documents
        );

        SET v_booking_id = LAST_INSERT_ID();
        
        INSERT INTO booking_history (
            booking_id, booking_name,action_type, 
            customer_note, staff_note,
            new_status_id, new_status_code, new_status_label, new_status_color_code,
            to_branch_head_id, to_branch_head_name,
            to_assigned_head_district_id, to_assigned_head_district_name,
            action_by_id, action_by_name, action_by_role_id
        ) VALUES (
            v_booking_id, p_name, 'New Booking Created', 
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

        -- 2. Update bookings table
        UPDATE bookings
        SET 
            name             = COALESCE(p_name, name),
            mobile           = COALESCE(p_mobile, mobile),
            address          = COALESCE(p_address, address),
            notes            = COALESCE(p_notes, notes),
            login_role_id    = COALESCE(p_login_role_id, login_role_id),
            login_id         = COALESCE(p_login_id, login_id),
            login_name       = COALESCE(p_login_name, login_name),
            state_id         = COALESCE(p_state_id, state_id),
            state_name       = COALESCE(v_state_name, state_name),
            district_id      = COALESCE(p_district_id, district_id),
            district_name    = COALESCE(v_district_name, district_name),
            area_id          = COALESCE(p_area_id, area_id),
            area_name        = COALESCE(v_area_name, area_name),
            assigned_head_district_id = COALESCE(p_district_id, district_id),
            assigned_head_district_name = COALESCE(v_district_name, district_name),
            branch_head_id   = COALESCE(v_branch_head_id, branch_head_id),
            branch_head_name = COALESCE(v_branch_head_name, branch_head_name),
            documents        = COALESCE(p_documents, documents),
            updated_at       = CURRENT_TIMESTAMP
        WHERE id = p_id AND is_deleted = 0;

        SET v_booking_id = p_id;

        -- 3. Log history if customer name was updated
        IF p_name IS NOT NULL AND TRIM(p_name) <> '' AND (v_old_name IS NULL OR v_old_name <> TRIM(p_name)) THEN
            INSERT INTO booking_history (
                booking_id, booking_name, action_type,
                customer_note, staff_note,
                action_by_id, action_by_name, action_by_role_id
            ) VALUES (
                v_booking_id, 
                TRIM(p_name), 
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
                booking_id, booking_name, action_type,
                customer_note, staff_note,
                action_by_id, action_by_name, action_by_role_id
            ) VALUES (
                v_booking_id, COALESCE(TRIM(p_name), v_old_name), 'Customer Notes Updated',
                p_notes, NULL,
                p_login_id, p_login_name, p_login_role_id
            );
        END IF;
    END IF;


    -- =========================================================================
    -- RETURN THE SAVED / UPDATED RECORD
    -- =========================================================================
    SELECT 
		id, name, mobile, address, notes,
        status_id, status_code, status_label, status_color_code, schedule_date,
        login_role_id, login_id, login_name,
        state_id, state_name, district_id, district_name,
		area_id, area_name, assigned_head_district_id, 
		assigned_head_district_name, branch_head_id, branch_head_name,
        documents, is_deleted, created_at, updated_at
    FROM bookings
    WHERE id = v_booking_id AND is_deleted = 0;

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
        TRIM(d.name) AS district_name,
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_status_options`()
BEGIN
    SELECT 
        id,
        code,
        label,
        color_code AS colorCode,
        sort_order AS sortOrder,
        is_active AS isActive
    FROM status_options
    WHERE is_active = 1
    ORDER BY sort_order ASC, id ASC;
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_booking_status_or_branch_head`(
    IN p_client_id       INT,
    IN p_client_name     VARCHAR(150),
    IN p_status_input    VARCHAR(50),   -- status_id ('1','2','3') or name ('New','Scheduled','Completed','Cancelled')
    IN p_schedule_date   DATE,
    IN p_staff_notes           TEXT,
    IN p_created_by      INT,
    IN p_created_by_name VARCHAR(100),
    IN p_branch_head_id  INT
)
BEGIN
    DECLARE v_clean_date DATE;
    DECLARE v_client_name VARCHAR(150);
    DECLARE v_created_by_name VARCHAR(100);
    DECLARE v_branch_head_id INT;
    DECLARE v_branch_head_name VARCHAR(150);
    DECLARE v_branch_head_district_id INT;
    DECLARE v_branch_head_district_name VARCHAR(100);
    
    -- Replace the existing v_status_* declarations with these (no DEFAULT values)
    DECLARE v_status_id INT;
    DECLARE v_status_code VARCHAR(50);
    DECLARE v_status_label VARCHAR(100);
    DECLARE v_status_color_code VARCHAR(20);

    -- Add these new variables to track old values and acting user's role
    DECLARE v_old_status_id INT;
    DECLARE v_old_status_code VARCHAR(50);
    DECLARE v_old_status_label VARCHAR(100);
    DECLARE v_old_status_color_code VARCHAR(20);
    
	DECLARE v_old_schedule_date DATE;

    
    DECLARE v_old_branch_head_id INT;
    DECLARE v_old_branch_head_name VARCHAR(150);
    DECLARE v_old_assigned_head_district_id INT;
    DECLARE v_old_assigned_head_district_name VARCHAR(100);
    DECLARE v_creator_role_id INT;

    -- 1. Fetch previous values from bookings table first
    SELECT 
        status_id, status_code, status_label, status_color_code,
        branch_head_id, branch_head_name,
        assigned_head_district_id, assigned_head_district_name,
        schedule_date
    INTO 
        v_old_status_id, v_old_status_code, v_old_status_label, v_old_status_color_code,
        v_old_branch_head_id, v_old_branch_head_name,
        v_old_assigned_head_district_id, v_old_assigned_head_district_name,
        v_old_schedule_date
    FROM bookings 
    WHERE id = p_client_id LIMIT 1;

    -- Initialize with existing values in case they aren't provided in params
    SET v_status_id = v_old_status_id;
    SET v_status_code = v_old_status_code;
    SET v_status_label = v_old_status_label;
    SET v_status_color_code = v_old_status_color_code;
    SET v_branch_head_id = v_old_branch_head_id;
    SET v_branch_head_name = v_old_branch_head_name;
    SET v_branch_head_district_id = v_old_assigned_head_district_id;
    SET v_branch_head_district_name = v_old_assigned_head_district_name;
    
    -- 1. Auto-fetch client_name if omitted
    SET v_client_name = TRIM(p_client_name);
    IF v_client_name IS NULL OR v_client_name = '' THEN
        SELECT name INTO v_client_name FROM bookings WHERE id = p_client_id LIMIT 1;
    END IF;
    -- 2. Auto-fetch created_by_name and user role
    SET v_created_by_name = TRIM(p_created_by_name);
    IF p_created_by IS NOT NULL THEN
        IF v_created_by_name IS NULL OR v_created_by_name = '' THEN
            SELECT name, role_id INTO v_created_by_name, v_creator_role_id FROM users WHERE id = p_created_by LIMIT 1;
        ELSE
            SELECT role_id INTO v_creator_role_id FROM users WHERE id = p_created_by LIMIT 1;
        END IF;
    END IF;

    -- 3. Lookup Selected Branch Head AND their assigned District directly from users table
    IF p_branch_head_id IS NOT NULL AND p_branch_head_id > 0 THEN
        SET v_branch_head_id = p_branch_head_id;
        SELECT u.name, u.district_id, COALESCE(d.name, u.district_name)
        INTO v_branch_head_name, v_branch_head_district_id, v_branch_head_district_name
        FROM users u
        LEFT JOIN districts d ON d.id = u.district_id
        WHERE u.id = p_branch_head_id AND u.role_id = 3 AND u.is_deleted = 0
        LIMIT 1;
    END IF;

    -- 4. Resolve status details from status_options table (by id, code, or label)
    IF p_status_input IS NOT NULL AND TRIM(p_status_input) != '' THEN
        SELECT id, code, label, color_code
        INTO v_status_id, v_status_code, v_status_label, v_status_color_code
        FROM status_options
        WHERE id = p_status_input
           OR LOWER(code) = LOWER(TRIM(p_status_input))
           OR LOWER(label) = LOWER(TRIM(p_status_input))
        LIMIT 1;
    END IF;
    -- 5. If Cancelled, clear schedule_date
    IF LOWER(v_status_code) = 'cancelled' THEN
        SET v_clean_date = NULL;
    ELSE
        SET v_clean_date = p_schedule_date;
    END IF;
    
    -- 7. Insert into booking_history

    -- Case B: Branch Head Changed -> 'Transfered'
    IF p_branch_head_id IS NOT NULL AND p_branch_head_id > 0 AND (v_old_branch_head_id IS NULL OR v_old_branch_head_id <> p_branch_head_id) THEN
        INSERT INTO booking_history (
            booking_id, booking_name, action_type, staff_note,
            from_branch_head_id, from_branch_head_name,
            to_branch_head_id, to_branch_head_name,
            from_assigned_head_district_id, from_assigned_head_district_name,
            to_assigned_head_district_id, to_assigned_head_district_name,
            action_by_id, action_by_name, action_by_role_id
        ) VALUES (
            p_client_id, v_client_name, 'Transfered', NULLIF(TRIM(p_staff_notes), ''),
            v_old_branch_head_id, v_old_branch_head_name,
            p_branch_head_id, v_branch_head_name,
            v_old_assigned_head_district_id, v_old_assigned_head_district_name,
            v_branch_head_district_id, v_branch_head_district_name,
            p_created_by, v_created_by_name, v_creator_role_id
        );
    END IF;
    
        -- Case A: Status Changed -> 'Status Updated'
    IF v_old_status_id IS NOT NULL AND v_status_id IS NOT NULL AND v_old_status_id <> v_status_id THEN
        INSERT INTO booking_history (
            booking_id, booking_name, action_type, staff_note,
            old_status_id, old_status_code, old_status_label, old_status_color_code,
            new_status_id, new_status_code, new_status_label, new_status_color_code,
            old_schedule_date, new_schedule_date,
            action_by_id, action_by_name, action_by_role_id
        ) VALUES (
            p_client_id, v_client_name, 'Status Updated', NULLIF(TRIM(p_staff_notes), ''),
            v_old_status_id, v_old_status_code, v_old_status_label, v_old_status_color_code,
            v_status_id, v_status_code, v_status_label, v_status_color_code,
            v_old_schedule_date, v_clean_date,
            p_created_by, v_created_by_name, v_creator_role_id
        );

    -- Case C: Status remained 'Scheduled', but schedule_date was modified
    ELSEIF LOWER(v_status_code) = 'scheduled' AND v_clean_date IS NOT NULL AND (v_old_schedule_date IS NULL OR v_old_schedule_date <> v_clean_date) THEN
        INSERT INTO booking_history (
            booking_id, booking_name, action_type, staff_note,
            old_status_id, old_status_code, old_status_label, old_status_color_code,
            new_status_id, new_status_code, new_status_label, new_status_color_code,
            old_schedule_date, new_schedule_date,
            action_by_id, action_by_name, action_by_role_id
        ) VALUES (
            p_client_id, 
            v_client_name, 
            CONCAT('Scheduled Date Changed from "', COALESCE(DATE_FORMAT(v_old_schedule_date, '%d-%m-%Y'), 'None'), '" to "', DATE_FORMAT(v_clean_date, '%d-%m-%Y'), '"'),
            NULLIF(TRIM(p_staff_notes), ''),
            v_old_status_id, v_old_status_code, v_old_status_label, v_old_status_color_code,
            v_status_id, v_status_code, v_status_label, v_status_color_code,
            v_old_schedule_date, v_clean_date,
            p_created_by, v_created_by_name, v_creator_role_id
        );
    END IF;

    
    -- 7. Update bookings table with new status and selected branch head + their assigned district
    UPDATE bookings
    SET 
        status_id                   = v_status_id,
        status_code                 = v_status_code,
        status_label                = v_status_label,
        status_color_code           = v_status_color_code,
        schedule_date               = v_clean_date,
        staff_notes = CASE WHEN p_staff_notes IS NOT NULL AND TRIM(p_staff_notes) != '' THEN TRIM(p_staff_notes) ELSE staff_notes END,
        branch_head_id              = COALESCE(p_branch_head_id, branch_head_id),
        branch_head_name            = COALESCE(v_branch_head_name, branch_head_name),
        assigned_head_district_id   = CASE WHEN p_branch_head_id IS NOT NULL AND p_branch_head_id > 0 THEN v_branch_head_district_id ELSE assigned_head_district_id END,
        assigned_head_district_name = CASE WHEN p_branch_head_id IS NOT NULL AND p_branch_head_id > 0 THEN v_branch_head_district_name ELSE assigned_head_district_name END,
        created_by                  = COALESCE(p_created_by, created_by),
        created_by_name             = COALESCE(v_created_by_name, created_by_name),
        updated_at                  = CURRENT_TIMESTAMP
    WHERE id = p_client_id AND is_deleted = 0;
    -- 8. Return updated booking record
    SELECT 
        b.id,
        b.id AS client_id,
        b.name AS client_name,
        b.status_id,
        b.status_code,
        b.status_label AS status,
        b.status_color_code,
        b.schedule_date,
        b.notes,
        b.staff_notes,
        b.assigned_head_district_id,
        b.assigned_head_district_name,
        b.branch_head_id,
        b.branch_head_name,
        b.created_by,
        b.created_by_name,
        b.updated_at
    FROM bookings b
    WHERE b.id = p_client_id;
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
