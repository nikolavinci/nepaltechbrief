<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CA_DB {
    public static function install() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

        // 1. Sources Table
        $table_sources = $wpdb->prefix . 'ca_sources';
        $sql_sources = "CREATE TABLE $table_sources (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            type varchar(50) NOT NULL,
            url text NOT NULL,
            language varchar(10) DEFAULT 'en' NOT NULL,
            target_language varchar(10) DEFAULT 'ne' NOT NULL,
            default_category int(11) DEFAULT 1 NOT NULL,
            auto_publish tinyint(1) DEFAULT 0 NOT NULL,
            enabled tinyint(1) DEFAULT 1 NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta( $sql_sources );

        // 2. URLs / Queue Table
        $table_urls = $wpdb->prefix . 'ca_urls';
        $sql_urls = "CREATE TABLE $table_urls (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            source_id mediumint(9) NOT NULL,
            url varchar(768) NOT NULL,
            url_hash varchar(32) NOT NULL,
            status varchar(20) DEFAULT 'pending' NOT NULL,
            content_hash varchar(32) DEFAULT '' NOT NULL,
            post_id bigint(20) DEFAULT 0 NOT NULL,
            retry_count int(11) DEFAULT 0 NOT NULL,
            discovered_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            processed_at datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY url_hash (url_hash)
        ) $charset_collate;";
        dbDelta( $sql_urls );

        // 3. Logs Table
        $table_logs = $wpdb->prefix . 'ca_logs';
        $sql_logs = "CREATE TABLE $table_logs (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            time datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            level varchar(20) DEFAULT 'INFO' NOT NULL,
            action varchar(100) NOT NULL,
            message text NOT NULL,
            source_id mediumint(9) DEFAULT 0,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta( $sql_logs );
    }
}