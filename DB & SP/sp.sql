DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_user`(
    IN p_user_code VARCHAR(50),
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_role ENUM('superadmin', 'admin', 'subadmin', 'customer'),
    IN p_user_type ENUM('company', 'coordinator', 'branch_head', 'customer', 'dealer'),
    IN p_name VARCHAR(150),
    IN p_email VARCHAR(150),
    IN p_phone VARCHAR(25),
    IN p_state_id INT,
    IN p_district_id INT,
    IN p_branch_id INT,
    IN p_area_id INT,
    IN p_address TEXT,
    IN p_dealer_license VARCHAR(100)
)
BEGIN
    -- Validate: Customers and dealers must have state_id and branch_id
    IF (p_role = 'customer') AND (p_state_id IS NULL OR p_branch_id IS NULL) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Customers and dealers must be assigned to both a state_id and a branch_id.';
    END IF;

    INSERT INTO users (
        user_code, username, password, role, user_type, name, email, phone,
        state_id, district_id, branch_id, area_id, address, dealer_license
    ) VALUES (
        p_user_code, p_username, p_password, p_role, p_user_type, p_name, p_email, p_phone,
        p_state_id, p_district_id, p_branch_id, p_area_id, p_address, p_dealer_license
    );

    -- Return the newly created user record
    SELECT * FROM users WHERE id = LAST_INSERT_ID();
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_districts_by_state`(
    IN p_state_id INT
)
BEGIN
    SELECT 
        d.id AS districtId,
        d.name AS districtName,
        d.code AS districtCode,
        s.id AS stateId,
        s.name AS stateName,
        s.code AS stateCode
    FROM districts d
    INNER JOIN states s ON d.state_id = s.id
    WHERE (p_state_id IS NULL OR d.state_id = p_state_id)
    ORDER BY d.name ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_users_by_filter`(
    IN p_role VARCHAR(50),
    IN p_user_type VARCHAR(50),
    IN p_branch_id INT
)
BEGIN
    SELECT 
        u.id,
        u.user_code AS userCode,
        u.username,
        u.role,
        u.user_type AS userType,
        u.name,
        u.email,
        u.phone,
        u.state_id AS stateId,
        s.name AS stateName,
        u.district_id AS districtId,
        d.name AS districtName,
        u.branch_id AS branchId,
        b.name AS branchName,
        u.address,
        u.dealer_license AS dealerLicense,
        u.is_active AS isActive,
        u.created_at AS createdAt
    FROM users u
    LEFT JOIN states s ON u.state_id = s.id
    LEFT JOIN districts d ON u.district_id = d.id
    LEFT JOIN branches b ON u.branch_id = b.id
    WHERE (p_role IS NULL OR u.role = p_role)
      AND (p_user_type IS NULL OR u.user_type = p_user_type)
      AND (p_branch_id IS NULL OR u.branch_id = p_branch_id)
      AND u.is_active = 1
    ORDER BY u.created_at DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `login_users`(
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT DEFAULT NULL;

    -- Verify credentials
    SELECT id INTO v_user_id
    FROM users
    WHERE username = p_username 
      AND password = p_password 
      AND is_active = 1
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        -- Update last login timestamp
        UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = v_user_id;

        -- Return enriched user profile
        SELECT 
            u.id,
            u.user_code AS userCode,
            u.username,
            u.role,
            u.user_type AS userType,
            u.name,
            u.email,
            u.phone,
            u.state_id AS stateId,
            s.name AS stateName,
            u.district_id AS districtId,
            d.name AS districtName,
            d.code AS districtCode,
            u.branch_id AS branchId,
            b.name AS branchName,
            b.branch_code AS branchCode,
            u.area_id AS areaId,
            a.name AS areaName,
            u.address,
            u.dealer_license AS dealerLicense,
            u.last_login_at AS lastLoginAt,
            u.created_at AS createdAt
        FROM users u
        LEFT JOIN states s ON u.state_id = s.id
        LEFT JOIN districts d ON u.district_id = d.id
        LEFT JOIN branches b ON u.branch_id = b.id
        LEFT JOIN areas a ON u.area_id = a.id
        WHERE u.id = v_user_id;
    ELSE
        -- Return empty resultset if authentication fails
        SELECT NULL AS id WHERE 1 = 0;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_authenticate_user`(
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT DEFAULT NULL;

    -- Verify credentials
    SELECT id INTO v_user_id
    FROM users
    WHERE username = p_username 
      AND password = p_password 
      AND is_active = 1
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        -- Update last login timestamp
        UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = v_user_id;

        -- Return enriched user profile
        SELECT 
            u.id,
            u.user_code AS userCode,
            u.username,
            u.role,
            u.user_type AS userType,
            u.name,
            u.email,
            u.phone,
            u.state_id AS stateId,
            s.name AS stateName,
            u.district_id AS districtId,
            d.name AS districtName,
            d.code AS districtCode,
            u.branch_id AS branchId,
            b.name AS branchName,
            b.branch_code AS branchCode,
            u.area_id AS areaId,
            a.name AS areaName,
            u.address,
            u.dealer_license AS dealerLicense,
            u.last_login_at AS lastLoginAt,
            u.created_at AS createdAt
        FROM users u
        LEFT JOIN states s ON u.state_id = s.id
        LEFT JOIN districts d ON u.district_id = d.id
        LEFT JOIN branches b ON u.branch_id = b.id
        LEFT JOIN areas a ON u.area_id = a.id
        WHERE u.id = v_user_id;
    ELSE
        -- Return empty resultset if authentication fails
        SELECT NULL AS id WHERE 1 = 0;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_user`(
    IN p_user_code VARCHAR(50),
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_role ENUM('superadmin', 'admin', 'subadmin', 'customer'),
    IN p_user_type ENUM('company', 'coordinator', 'branch_head', 'customer', 'dealer'),
    IN p_name VARCHAR(150),
    IN p_email VARCHAR(150),
    IN p_phone VARCHAR(25),
    IN p_state_id INT,
    IN p_district_id INT,
    IN p_branch_id INT,
    IN p_area_id INT,
    IN p_address TEXT,
    IN p_dealer_license VARCHAR(100)
)
BEGIN
    -- Validate: Customers and dealers must have state_id and branch_id
    IF (p_role = 'customer') AND (p_state_id IS NULL OR p_branch_id IS NULL) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Customers and dealers must be assigned to both a state_id and a branch_id.';
    END IF;

    INSERT INTO users (
        user_code, username, password, role, user_type, name, email, phone,
        state_id, district_id, branch_id, area_id, address, dealer_license
    ) VALUES (
        p_user_code, p_username, p_password, p_role, p_user_type, p_name, p_email, p_phone,
        p_state_id, p_district_id, p_branch_id, p_area_id, p_address, p_dealer_license
    );

    -- Return the newly created user record
    SELECT * FROM users WHERE id = LAST_INSERT_ID();
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_districts_by_state`(
    IN p_state_id INT
)
BEGIN
    SELECT 
        d.id AS districtId,
        d.name AS districtName,
        d.code AS districtCode,
        s.id AS stateId,
        s.name AS stateName,
        s.code AS stateCode
    FROM districts d
    INNER JOIN states s ON d.state_id = s.id
    WHERE (p_state_id IS NULL OR d.state_id = p_state_id)
    ORDER BY d.name ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_users_by_filter`(
    IN p_role VARCHAR(50),
    IN p_user_type VARCHAR(50),
    IN p_branch_id INT
)
BEGIN
    SELECT 
        u.id,
        u.user_code AS userCode,
        u.username,
        u.role,
        u.user_type AS userType,
        u.name,
        u.email,
        u.phone,
        u.state_id AS stateId,
        s.name AS stateName,
        u.district_id AS districtId,
        d.name AS districtName,
        u.branch_id AS branchId,
        b.name AS branchName,
        u.address,
        u.dealer_license AS dealerLicense,
        u.is_active AS isActive,
        u.created_at AS createdAt
    FROM users u
    LEFT JOIN states s ON u.state_id = s.id
    LEFT JOIN districts d ON u.district_id = d.id
    LEFT JOIN branches b ON u.branch_id = b.id
    WHERE (p_role IS NULL OR u.role = p_role)
      AND (p_user_type IS NULL OR u.user_type = p_user_type)
      AND (p_branch_id IS NULL OR u.branch_id = p_branch_id)
      AND u.is_active = 1
    ORDER BY u.created_at DESC;
END$$
DELIMITER ;
