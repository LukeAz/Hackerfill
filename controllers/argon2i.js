const argon2 = require('argon2');
const config = require('../config/config.json');
/**
 * Argon2, the password-hashing function that won the Password Hashing Competition (PHC).
 * Is a password-hashing function that summarizes the state of the art in the design of memory-hard functions 
 * and can be used to hash passwords for credential storage, key derivation, or other applications.
 * Nodejs repository: https://github.com/ranisalt/node-argon2
 * The variant of the hash function. Argon2 has several variants with different aims:
 * - argon2d is faster and highly resistant against GPU attacks, which is useful for cryptocurrency
 * - argon2i is slower and resistant against tradeoff attacks, which is preferred for password hashing and key derivation
 * - argon2id is a hybrid combination of the above, being resistant against GPU and tradeoff attacks
 * 
 * General settings:
 * memory =  256 MB, timeCost =    2, parallelism = 8, Time = 0.732 s
 * memory =  128 MB, timeCost =    6, parallelism = 8, Time = 0.99 s
 * memory =   64 MB, timeCost =   12, parallelism = 8, Time = 0.968 s
 * memory =   32 MB, timeCost =   24, parallelism = 8, Time = 0.896 s
 * memory =   16 MB, timeCost =   49, parallelism = 8, Time = 0.973 s
 * memory =    8 MB, timeCost =   96, parallelism = 8, Time = 0.991 s
 * memory =    4 MB, timeCost =  190, parallelism = 8, Time = 0.977 s
 * 
 * To make the hash almost impossible to decrypt in case of a database dump, 
 * we can hide options set for the argon algorithm.
 */

module.exports = {
  hash: async (password) => {
    return (await argon2.hash(password, {
      type: argon2.argon2i, 
      timeCost: config.argon2i.timeCost,
      memoryCost: config.argon2i.memoryCost,
      parallelism: config.argon2i.parallelism
    })).split(`$argon2i$v=19$m=${config.argon2i.memoryCost},t=${config.argon2i.timeCost},p=${config.argon2i.parallelism}`)[1];
  },
  verify: async (password, hash) => {
    return await argon2.verify(`$argon2i$v=19$m=${config.argon2i.memoryCost},t=${config.argon2i.timeCost},p=${config.argon2i.parallelism}` + hash, password);
  }
}