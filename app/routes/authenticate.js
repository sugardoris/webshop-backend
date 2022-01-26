
module.exports=function(express, pool){

    let authRouter = express.Router();

    authRouter.post('/', async function(req,res){

        try {
            let conn = await pool.getConnection();
            let rows = await conn.query('SELECT * FROM users WHERE email=?', req.body.email);
            conn.release();

            if (rows.length > 0 && rows[0].password === req.body.password){
                res.json({ status: '200', user:rows[0]});
            } else if (rows.length > 0){
                res.json({ status: '403', description:'Wrong password' });
            } else {
                res.json({ status: '403', description:"User with this email doesn't exist" });
            }
        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});
        }
    });

    return authRouter;
};
