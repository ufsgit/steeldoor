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
        COUNT(*) AS total_activities

    FROM booking_history bh
    LEFT JOIN bookings b ON b.id = bh.booking_id
    WHERE DATE(bh.created_at) BETWEEN v_from AND v_to
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
        WHERE role_id = 3 AND district_id = p_district_id AND is_deleted = 0 AND is_active = 1
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_seed_steeldoor_data`(IN p_execute INT)
proc_label: BEGIN
    -- =========================================================================
    -- Execution Guard: 1 = Proceed, 0 = Abort
    -- =========================================================================
    IF p_execute != 1 THEN
        SELECT 'Aborted: Flag was not 1. No data was modified.' AS `status_message`;
        LEAVE proc_label;
    END IF;

    SET SESSION sql_mode = '';
    SET FOREIGN_KEY_CHECKS = 0;

    -- Clear existing tables cleanly
    TRUNCATE TABLE `booking_history`;
    TRUNCATE TABLE `bookings`;
    TRUNCATE TABLE `users`;
    TRUNCATE TABLE `areas`;
    TRUNCATE TABLE `districts`;

    -- =========================================================================
    -- Step 1: Insert 14 Kerala Districts
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
    -- Step 2: Insert Comprehensive Areas Across All 14 Districts
    -- =========================================================================
    INSERT INTO `areas` (`district_id`, `name`, `pincode`) VALUES
    -- 1: Thiruvananthapuram
    (1, 'Kowdiar', '695003'), (1, 'Technopark', '695581'), (1, 'Kazhakkoottam', '695582'),
    (1, 'Pattom', '695004'), (1, 'Vellayambalam', '695010'), (1, 'Thampanoor', '695001'),
    (1, 'Neyyattinkara', '695121'), (1, 'Attingal', '695101'), (1, 'Nedumangad', '695541'),
    (1, 'Varkala', '695141'), (1, 'Sreekaryam', '695017'), (1, 'Nemom', '695020'),
    (1, 'Peroorkada', '695005'), (1, 'Poojappura', '695012'), (1, 'Karamana', '695002'),
    -- 2: Kollam
    (2, 'Chinnakada', '691001'), (2, 'Kavanad', '691003'), (2, 'Karunagappally', '690518'),
    (2, 'Kottarakkara', '691506'), (2, 'Punalur', '691305'), (2, 'Paravur', '691301'),
    (2, 'Sasthamkotta', '690521'), (2, 'Kundara', '691501'), (2, 'Chathannoor', '691572'),
    (2, 'Anchal', '691306'), (2, 'Pathanapuram', '691695'), (2, 'Ayur', '691533'),
    -- 3: Pathanamthitta
    (3, 'Central Pathanamthitta', '689645'), (3, 'Adoor', '691523'), (3, 'Thiruvalla', '689101'),
    (3, 'Ranni', '689672'), (3, 'Kozhencherry', '689641'), (3, 'Konni', '689691'),
    (3, 'Pandalam', '689501'), (3, 'Mallappally', '689585'), (3, 'Kumbanad', '689547'),
    -- 4: Alappuzha
    (4, 'Boat Jetty Area', '688001'), (4, 'Mullakkal', '688011'), (4, 'Cherthala', '688524'),
    (4, 'Kayamkulam', '690502'), (4, 'Mavelikkara', '690101'), (4, 'Chengannur', '689121'),
    (4, 'Haripad', '690514'), (4, 'Ambalapuzha', '688561'), (4, 'Mararikulam', '688523'),
    (4, 'Kuttanad', '688504'), (4, 'Aroor', '688534'),
    -- 5: Kottayam
    (5, 'Kottayam Town', '686001'), (5, 'Kanjikuzhy', '686004'), (5, 'Changanassery', '686101'),
    (5, 'Pala', '686575'), (5, 'Ettumanoor', '686631'), (5, 'Vaikom', '686141'),
    (5, 'Kanjirappally', '686507'), (5, 'Erattupetta', '686121'), (5, 'Pampady', '686502'),
    (5, 'Manarcad', '686019'), (5, 'Kuravilangad', '686633'),
    -- 6: Idukki
    (6, 'Painavu', '685603'), (6, 'Thodupuzha', '685584'), (6, 'Kattappana', '685508'),
    (6, 'Munnar', '685612'), (6, 'Adimali', '685561'), (6, 'Nedumkandam', '685553'),
    (6, 'Kumily', '685509'), (6, 'Peermade', '685531'), (6, 'Vandiperiyar', '685533'),
    -- 7: Ernakulam
    (7, 'Edapally', '682024'), (7, 'Kakkanad', '682030'), (7, 'Aluva', '683101'),
    (7, 'Palarivattom', '682025'), (7, 'Fort Kochi', '682001'), (7, 'Vyttila', '682019'),
    (7, 'Kaloor', '682017'), (7, 'Tripunithura', '682301'), (7, 'Kadavanthra', '682020'),
    (7, 'Panampilly Nagar', '682036'), (7, 'Marine Drive', '682031'), (7, 'Ravipuram', '682016'),
    (7, 'Thrikkakara', '682021'), (7, 'Kalamassery', '683104'), (7, 'Angamaly', '683572'),
    (7, 'Perumbavoor', '683542'), (7, 'Muvattupuzha', '686661'), (7, 'Kothamangalam', '686691'),
    (7, 'North Paravur', '683513'), (7, 'Mattancherry', '682002'), (7, 'Thevara', '682013'),
    (7, 'Maradu', '682304'), (7, 'Cherai', '683514'), (7, 'Piravom', '686664'), (7, 'Kolenchery', '682311'),
    -- 8: Thrissur
    (8, 'Round North', '680001'), (8, 'Punkunnam', '680002'), (8, 'Ayyanthole', '680003'),
    (8, 'Ollur', '680306'), (8, 'Chalakudy', '680307'), (8, 'Kodungallur', '680664'),
    (8, 'Kunnamkulam', '680503'), (8, 'Guruvayur', '680101'), (8, 'Irinjalakuda', '680121'),
    (8, 'Wadakkanchery', '680582'), (8, 'Mannuthy', '680651'), (8, 'Chavakkad', '680506'),
    -- 9: Palakkad
    (9, 'Palakkad Town', '678001'), (9, 'Ottapalam', '679101'), (9, 'Shoranur', '679121'),
    (9, 'Chittur', '678101'), (9, 'Mannarkkad', '678582'), (9, 'Alathur', '678541'),
    (9, 'Pattambi', '679303'), (9, 'Cherpulassery', '679503'), (9, 'Vadakkencherry', '678683'),
    -- 10: Malappuram
    (10, 'Malappuram Town', '676505'), (10, 'Manjeri', '676121'), (10, 'Perinthalmanna', '679322'),
    (10, 'Tirur', '676101'), (10, 'Ponnani', '679577'), (10, 'Kottakkal', '676503'),
    (10, 'Nilambur', '679329'), (10, 'Kondotty', '673638'), (10, 'Valanchery', '676552'),
    (10, 'Tanur', '676302'), (10, 'Parappanangadi', '676303'),
    -- 11: Kozhikode
    (11, 'Mavoor Road', '673004'), (11, 'Palayam', '673001'), (11, 'Mananchira', '673001'),
    (11, 'Chevayur', '673017'), (11, 'Medical College', '673008'), (11, 'Vadakara', '673101'),
    (11, 'Koyilandy', '673305'), (11, 'Ramanattukara', '673633'), (11, 'Feroke', '673631'),
    (11, 'Thamarassery', '673573'), (11, 'Balussery', '673612'), (11, 'Koduvally', '673572'),
    -- 12: Wayanad
    (12, 'Kalpetta', '673121'), (12, 'Sulthan Bathery', '673592'), (12, 'Mananthavady', '670645'),
    (12, 'Meppadi', '673577'), (12, 'Vythiri', '673576'), (12, 'Panamaram', '670721'),
    (12, 'Ambalavayal', '673593'), (12, 'Pulpally', '673579'),
    -- 13: Kannur
    (13, 'Thana', '670012'), (13, 'Payyambalam', '670001'), (13, 'South Bazar', '670002'),
    (13, 'Talap', '670002'), (13, 'Payyanur', '670307'), (13, 'Thalassery', '670101'),
    (13, 'Mattannur', '670702'), (13, 'Iritty', '670703'), (13, 'Taliparamba', '670141'),
    (13, 'Kuthuparamba', '670643'), (13, 'Chakkarakkal', '670613'),
    -- 14: Kasaragod
    (14, 'Kasaragod Town', '671121'), (14, 'Kanhangad', '671315'), (14, 'Nileshwaram', '671314'),
    (14, 'Uppala', '671322'), (14, 'Manjeshwar', '671323'), (14, 'Cheruvathur', '671313'),
    (14, 'Bekal', '671318'), (14, 'Kumbla', '671321');

    -- =========================================================================
    -- Step 3: Insert Exactly 10,000 Users
    -- =========================================================================

    -- 3a. 14 Branch Heads (IDs 1..14)
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

    -- 3b. 20 Company Logins (IDs 15..34)
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
        UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
        UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
        UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20
    ) seq;

    -- 3c. 50 Coordinator Logins (IDs 35..84)
    INSERT INTO `users` (
        `id`, `username`, `password`, `role_id`, `role`, `user_type_id`, `user_type`,
        `name`, `email`, `phone`, `state_id`, `state_name`, `district_id`, `district_name`, `is_active`
    )
    SELECT
        34 + seq.n,
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
        SELECT (a.n + b.n * 10 + 1) AS n
        FROM (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a
        CROSS JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) b
    ) seq;

    -- 3d. 9,916 Dealers (IDs 85..10000)
    INSERT INTO `users` (
        `id`, `username`, `password`, `role_id`, `role`, `user_type_id`, `user_type`,
        `name`, `email`, `phone`, `state_id`, `state_name`, `district_id`, `district_name`, `address`, `is_active`
    )
    SELECT
        84 + seq.n,
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
        WHERE (u1.n + u10.n * 10 + u100.n * 100 + u1000.n * 1000 + 1) <= 9916
    ) seq;

    -- =========================================================================
    -- Step 4: Insert Exactly 10,000 Bookings
    -- =========================================================================
    INSERT INTO `bookings` (
        `id`, `name`, `mobile`, `address`, `notes`, `staff_notes`,
        `status_id`, `status_code`, `status_label`, `status_color_code`,
        `schedule_date`, `state_id`, `state_name`,
        `district_id`, `district_name`, `area_id`, `area_name`,
        `assigned_head_district_id`, `assigned_head_district_name`,
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
        
        CASE 
            WHEN st.id IN (2, 3) THEN DATE_ADD('2026-10-01', INTERVAL (b.booking_num % 50) DAY)
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
        bh.id AS `branch_head_id`,
        bh.name AS `branch_head_name`,
        
        '[]' AS `documents`,
        0 AS `is_deleted`,
        
        4 AS `login_role_id`,
        (84 + (1 + (b.booking_num % 9916))) AS `login_id`,
        CONCAT('Steel Doors Dealer ', (1 + (b.booking_num % 9916))) AS `login_name`,
        
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
    JOIN `status_options` st ON st.id = (1 + (b.booking_num % 4))
    JOIN (
        SELECT a.id, a.name, a.district_id,
               ROW_NUMBER() OVER (PARTITION BY a.district_id ORDER BY a.id) AS row_n,
               COUNT(*) OVER (PARTITION BY a.district_id) AS total_in_dist
        FROM `areas` a
    ) ar ON ar.district_id = dt.id AND ar.row_n = (1 + (b.booking_num % ar.total_in_dist));

    -- =========================================================================
    -- Step 5: Insert Booking History with ALL UI Dropdown Action Types
    -- =========================================================================

    -- 5a. Action: 'New Booking Created' (All 10,000 Bookings)
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type`, `customer_note`, `staff_note`,
        `new_status_id`, `new_status_code`, `new_status_label`, `new_status_color_code`,
        `to_assigned_head_district_id`, `to_assigned_head_district_name`,
        `to_branch_head_id`, `to_branch_head_name`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        'New Booking Created',
        bk.notes,
        NULL,
        1, 'New', 'New', '#3b82f6',
        bk.district_id, bk.district_name,
        bk.branch_head_id, bk.branch_head_name,
        bk.login_id, bk.login_name, bk.login_role_id,
        bk.created_at
    FROM `bookings` bk;

    -- 5b. Action: 'Status Updated' (For all bookings with Scheduled, Completed, Cancelled)
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type`, `customer_note`, `staff_note`,
        `old_status_id`, `old_status_code`, `old_status_label`, `old_status_color_code`,
        `new_status_id`, `new_status_code`, `new_status_label`, `new_status_color_code`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        'Status Updated',
        bk.notes,
        bk.staff_notes,
        1, 'New', 'New', '#3b82f6',
        bk.status_id, bk.status_code, bk.status_label, bk.status_color_code,
        bk.branch_head_id, bk.branch_head_name, 3,
        DATE_ADD(bk.created_at, INTERVAL 20 MINUTE)
    FROM `bookings` bk
    WHERE bk.status_id > 1;

    -- 5c. Action: 'Customer Name Updated from "..." to "..."' (Subset of bookings)
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type`, `customer_note`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        CONCAT('Customer Name Updated from "', bk.name, '" to "', bk.name, ' - Updated"'),
        'Customer clarified spelling over phone call.',
        (35 + (bk.id % 50)),
        CONCAT('Coordinator Officer ', (1 + (bk.id % 50))),
        2,
        DATE_ADD(bk.created_at, INTERVAL 35 MINUTE)
    FROM `bookings` bk
    WHERE (bk.id % 5) = 0; -- Every 5th booking (2,000 logs)

    -- 5d. Action: 'Customer Notes Updated' (Subset of bookings)
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type`, `customer_note`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        'Customer Notes Updated',
        CONCAT(bk.notes, ' [Special delivery instructions added: Deliver before 4 PM]'),
        (35 + (bk.id % 50)),
        CONCAT('Coordinator Officer ', (1 + (bk.id % 50))),
        2,
        DATE_ADD(bk.created_at, INTERVAL 45 MINUTE)
    FROM `bookings` bk
    WHERE (bk.id % 7) = 0; -- Every 7th booking (~1,428 logs)

    -- 5e. Action: 'Scheduled Date Changed' (Subset of Scheduled/Completed bookings)
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type`, `staff_note`,
        `old_schedule_date`, `new_schedule_date`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        'Scheduled Date Changed',
        'Customer requested rescheduling due to ongoing construction work.',
        bk.schedule_date,
        DATE_ADD(bk.schedule_date, INTERVAL 4 DAY),
        bk.branch_head_id, bk.branch_head_name, 3,
        DATE_ADD(bk.created_at, INTERVAL 55 MINUTE)
    FROM `bookings` bk
    WHERE bk.schedule_date IS NOT NULL AND (bk.id % 6) = 0; -- ~833 logs

    -- 5f. Action: 'Transfered' (Inter-district branch head reassignments)
    INSERT INTO `booking_history` (
        `booking_id`, `booking_name`, `action_type`, `staff_note`,
        `from_assigned_head_district_id`, `from_assigned_head_district_name`,
        `to_assigned_head_district_id`, `to_assigned_head_district_name`,
        `from_branch_head_id`, `from_branch_head_name`,
        `to_branch_head_id`, `to_branch_head_name`,
        `action_by_id`, `action_by_name`, `action_by_role_id`, `created_at`
    )
    SELECT
        bk.id,
        bk.name,
        'Transfered',
        'Area border reassignment transferred to neighboring district.',
        bk.district_id, bk.district_name,
        next_dt.id, next_dt.name,
        bk.branch_head_id, bk.branch_head_name,
        next_bh.id, next_bh.name,
        (15 + (bk.id % 20)),
        CONCAT('Company Executive ', (1 + (bk.id % 20))),
        1,
        DATE_ADD(bk.created_at, INTERVAL 65 MINUTE)
    FROM `bookings` bk
    JOIN `districts` next_dt ON next_dt.id = (1 + ((bk.district_id) % 14))
    JOIN `users` next_bh ON next_bh.role_id = 3 AND next_bh.district_id = next_dt.id
    WHERE (bk.id % 8) = 0; -- Every 8th booking (1,250 logs)

    SET FOREIGN_KEY_CHECKS = 1;

    -- Final Status Report
    SELECT 
        (SELECT COUNT(*) FROM `districts`) AS total_districts,
        (SELECT COUNT(*) FROM `areas`) AS total_areas,
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
        /*
        created_by                  = COALESCE(p_created_by, created_by),
        created_by_name             = COALESCE(v_created_by_name, created_by_name),
        */
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
