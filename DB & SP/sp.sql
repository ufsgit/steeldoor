DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `mobile_login`(
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT DEFAULT NULL;

    -- 1. Verify username, password, active status, and ensure role_id is 2 or 3
    SELECT id INTO v_user_id
    FROM users
    WHERE username = p_username 
      AND password = p_password 
      AND role_id IN (2, 3)
      AND is_active = 1
      AND is_deleted = 0
    LIMIT 1;

    -- 2. If valid, update last_login_at and return the user profile
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
    ELSE
        -- Return empty resultset if credentials are invalid or role is not 2/3
        SELECT NULL AS id WHERE 1 = 0;
    END IF;
END$$
DELIMITER ;
