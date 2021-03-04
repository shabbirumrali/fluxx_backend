const jwt = require('jsonwebtoken');
const config = require('config');
const JWT_KEY = config.get('JWT_KEY');
const JWT_HASH = config.get('JWT_HASH');

module.exports = {

// class ValidateRequest {
//     constructor(wagner) {
//     }
    validateToken: (req, res, next) => {
    //validateToken(req, res) {   
      const authorizationHeaader = req.headers.authorization;
      let result;
      if (authorizationHeaader) {
        const auth_token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        const options = { 
            algorithm: JWT_HASH 
        };
        try {
          // verify makes sure that the token hasn't expired and has been issued by us
          result = jwt.verify(auth_token, JWT_KEY, options,function(err,decoded){
                if(err){
                    res.status(401).json({
                        success: false,
                        message: 'Token not valid'
                    });
                }else{
                    // Let's pass back the decoded token to the request object
                    req.decoded = result;
                    // We call next to pass execution to the subsequent middleware
                    next();
                }
            });
        } catch (err) {
          // Throw an error just in case anything goes wrong with verification
          throw new Error(err);
        }
      } else {
        result = { 
          error: `Authentication error. Token required.`,
          status: 401
        };
        res.status(401).send(result);
      }
    }
};

//module.exports = ValidateRequest;