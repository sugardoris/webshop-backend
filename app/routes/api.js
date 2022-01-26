const {RowDataPacket} = require("mysql/lib/protocol/packets");
module.exports = function (express, pool, jwt, secret) {

    const apiRouter = express.Router();

    apiRouter.get('/', function(req, res) {
        res.json({ message: 'Hello world!' });
    });

    apiRouter.route('/users').get(async function(req, res) {
        try {
            let conn = await pool.getConnection();
            let rows = await conn.query('SELECT * FROM users');
            conn.release();
            res.json({ status: 'OK', users:rows});

        } catch (e) {
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});
        }
    }).post(async function(req, res) {
        const user = {
            email : req.body.email,
            password : req.body.password,
            role : req.body.role
        };

        try {
            let conn = await pool.getConnection();
            let q = await conn.query('INSERT INTO users SET ?', user);
            conn.release();
            res.json({ status: 'OK', insertId:q.insertId });
        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }
    });

    apiRouter.route('/users/:id').get(async function(req,res){
        try {
            let conn = await pool.getConnection();
            let rows = await conn.query('SELECT * FROM users WHERE id=?', req.params.id);
            conn.release();
            res.json({ status: 'OK', user:rows[0]});

        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});
        }
    }).delete(async function(req,res){
        try {
            let conn = await pool.getConnection();
            let q = await conn.query('DELETE FROM users WHERE id = ?', req.params.id);
            conn.release();
            res.json({ status: 'OK', affectedRows :q.affectedRows });
        } catch (e){
            res.json({ status: 'NOT OK' });
        }
    });

    apiRouter.route('/listings').get(async function(req, res) {

        const listings = [];
        const information = {
            description: '',
            materials: '',
            height: 0,
            width: 0,
            depth: 0
        }
        const listing = {
            title: '',
            info: information,
            price: 0,
            category: '',
            imageUrl: '',
            inStock: 0
        }

        try {
            let conn = await pool.getConnection();
            let rowsListings = await conn.query('SELECT * FROM listings');
            conn.release();
            console.log(rowsListings);

            for (let i = 0; i < rowsListings.length; i++) {

                let rowInfo = await conn.query('SELECT * FROM information WHERE listingId =?', rowsListings[i].id);
                information.description = rowInfo[0].description;
                information.materials = rowInfo[0].materials;
                information.width = rowInfo[0].width;
                information.height = rowInfo[0].height;
                information.depth = rowInfo[0].depth;

                let categoryName = await conn.query('SELECT name FROM categories WHERE id=?', rowsListings[i].categoryId);
                listing.category = categoryName[0].name;

                listing.title = rowsListings[i].title;
                listing.info = information;
                listing.price = rowsListings[i].price;
                listing.inStock = rowsListings[i].inStock;
                listing.imageUrl = rowsListings[i].imageUrl;

                listings.push(listing);
            }
            res.json({ status: 'OK', listings:listings});

        } catch (e) {
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});
        }
    }).post(async function(req, res) {

        const information = {
            listingId: 0,
            description: req.body.info['description'],
            materials: req.body.info['materials'],
            height: req.body.info['height'],
            width: req.body.info['width'],
            depth: req.body.info['depth']
        }

        const listing = {
            title: req.body.title,
            price: req.body.price,
            inStock: req.body.inStock,
            thumbImgUrl: req.body.imageUrl,
            imageUrl: req.body.imageUrl,
            categoryId: 0
        }

        try {
            let conn = await pool.getConnection();

            let id = await conn.query('SELECT id FROM categories WHERE name=?', req.body.category);
            listing.categoryId = id[0].id;

            let insertListing = await conn.query('INSERT INTO listings SET ?', listing);
            information.listingId = insertListing.insertId;
            let insertInfo = await conn.query('INSERT INTO information SET ?', information);

            conn.release();
            res.json({ status: 'OK', insertId:insertListing.insertId });
        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }
    });

    apiRouter.route('/listings/:id').get(async function(req, res) {

        const information = {
            description: '',
            materials: '',
            height: 0,
            width: 0,
            depth: 0
        }
        const listing = {
            title: '',
            info: information,
            price: 0,
            category: '',
            imageUrl: '',
            inStock: 0
        }

        try {
            let conn = await pool.getConnection();
            let rowsListings = await conn.query('SELECT * FROM listings WHERE id=?', req.params.id);
            conn.release();
            console.log(rowsListings);

            let rowInfo = await conn.query('SELECT * FROM information WHERE listingId =?', req.params.id);
            information.description = rowInfo[0].description;
            information.materials = rowInfo[0].materials;
            information.width = rowInfo[0].width;
            information.height = rowInfo[0].height;
            information.depth = rowInfo[0].depth;

            let categoryName = await conn.query('SELECT name FROM categories WHERE id=?', rowsListings[0].categoryId);
            listing.category = categoryName[0].name;

            listing.title = rowsListings[0].title;
            listing.info = information;
            listing.price = rowsListings[0].price;
            listing.inStock = rowsListings[0].inStock;
            listing.imageUrl = rowsListings[0].imageUrl;

            res.json({ status: 'OK', listing:listing});

        } catch (e) {
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});
        }
    }).put(async function(req, res) {

        const information = {
            listingId: req.params.id,
            description: req.body.info['description'],
            materials: req.body.info['materials'],
            height: req.body.info['height'],
            width: req.body.info['width'],
            depth: req.body.info['depth']
        }

        const listing = {
            title: req.body.title,
            price: req.body.price,
            inStock: req.body.inStock,
            thumbImgUrl: req.body.imageUrl,
            imageUrl: req.body.imageUrl,
            categoryId: 0
        }

        try {
            let conn = await pool.getConnection();

            let id = await conn.query('SELECT id FROM categories WHERE name=?', req.body.category);
            listing.categoryId = id[0].id;

            let updateListing = await conn.query('UPDATE listings SET ? WHERE id = ?', [listing, req.params.id]);

            let updateInfo = await conn.query('UPDATE information SET ? WHERE listingId = ?', [information, req.params.id]);

            conn.release();

            res.json({ status: 'OK', changedRows:updateListing.changedRows });
        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }

    }).delete(async function(req,res){

        try {
            let conn = await pool.getConnection();

            let deleteListingInfo = await conn.query('DELETE FROM information WHERE listingId = ?', req.params.id);
            let deleteListing = await conn.query('DELETE FROM listings WHERE id = ?', req.params.id);

            conn.release();

            res.json({ status: 'OK', affectedRows:deleteListing.affectedRows });

        } catch (e){
            res.json({ status: 'NOT OK' });
        }

    });

    return apiRouter;
}
