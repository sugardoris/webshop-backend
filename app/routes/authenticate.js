
module.exports=function(express, pool, crypto){

    let authRouter = express.Router();

    authRouter.post('/', async function(req,res){

        try {
            let conn = await pool.getConnection();
            let rows = await conn.query('SELECT * FROM users WHERE email=?', req.body.email);
            conn.release();

            if (rows.length === 0) {
                res.status(404).send({error: 'User with this email doesn\'t exist'});
            }
            if (rows.length > 0 && rows[0].salt) {
                let hash = crypto.pbkdf2Sync(req.body.password, rows[0].salt, 10000, 64, 'sha512');

                if (hash.toString('hex') === rows[0].password) {
                    res.json(rows[0]);
                }
                else {
                    res.status(403).send({error: 'Wrong password'});
                }
            }
            else if(rows.length > 0 && rows[0].password === req.body.password) {
                res.json(rows[0]);
            }
            else if (rows.length > 0){
                res.status(403).send({error: 'Wrong password'});
            }

        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});
        }
    });

    return authRouter;
};
