const express = require('express')
const router = express.Router()

const saucesCtrl = require('../controllers/sauces')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

// Route pour créer une nouvelle sauce
router.post('/', auth, multer, saucesCtrl.createThing);
   
// Route pour une seule sauce
router.get('/:id', auth, saucesCtrl.getOneThing)
  
// Route pour toutes les sauces
router.get('/', auth, saucesCtrl.getAllThings);
  
//Route pour modifier une sauce
router.put('/:id', auth, multer, saucesCtrl.modifyThing);

//Route pour supprimer une sauce
router.delete('/:id', auth, saucesCtrl.deleteThing);

//Like
router.post('/:id/like', auth, saucesCtrl.likeSauce);

module.exports = router