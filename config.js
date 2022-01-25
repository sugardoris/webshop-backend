module.exports = {
    pool: {
        connectionLimit: 100,
        host: 'localhost',
        user: 'root',
        password: 'pass',
        database: 'webshopdb',
        port: 3306,
        debug: false,
        insecureAuth: true,
        waitForConnections: true
    }
}
