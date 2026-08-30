<?php
/**
 * Plugin Name: Content Automaton
 * Plugin URI: https://nikolavinci.com
 * Description: Enterprise SEO/AEO/GEO/AIO Content Optimization pipeline. Seamlessly integrates external Python triggers and internal Queue-based fetching.
 * Version: 2.0.0
 * Author: nikolavinci
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'CA_DIR', plugin_dir_path( __FILE__ ) );
define( 'CA_URL', plugin_dir_url( __FILE__ ) );
define( 'CA_VERSION', '2.0.0' );

// Core Includes
require_once CA_DIR . 'includes/db/class-ca-db.php';
require_once CA_DIR . 'includes/admin/class-ca-admin.php';
require_once CA_DIR . 'includes/api/class-ca-rest-bridge.php';
require_once CA_DIR . 'includes/queue/class-ca-queue.php';
require_once CA_DIR . 'includes/engine/class-ca-ai-engine.php';

// Activation
register_activation_hook( __FILE__, [ 'CA_DB', 'install' ] );

// Initialize
add_action( 'plugins_loaded', function() {
    new CA_Admin();
    new CA_Rest_Bridge();
    new CA_Queue();
} );