const Thing = require('../models/Thing')
const fs = require('fs')

//Logique des routes

exports.createThing = (req, res, next) => {
    const thingObject = JSON.parse(req.body.sauce);
    delete thingObject._id;
    const thing = new Thing({
      ...thingObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    thing.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  };

exports.modifyThing = (req, res, next) => {
  const thingObject = req.file ?
    {
      ...JSON.parse(req.body.thing),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then(thing => {
      const filename = thing.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Thing.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};  

exports.getOneThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
    .then(thing => res.status(200).json(thing))
    .catch(error => res.status(404).json({ error }));
}

exports.getAllThings = (req, res, next) => {
    Thing.find()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
}

exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;
    const sauceId = req.params.id;
    Thing.findOne({ _id: sauceId })
      .then(sauce => {
        // nouvelles valeurs à modifier
        const newValues = {
            usersLiked: sauce.usersLiked,
            usersDisliked: sauce.usersDisliked,
            likes: 0 ,
            dislikes: 0
        }
        // Différents cas:
        switch (like) {
          case 1:  // CAS: sauce liked
              newValues.usersLiked.push(userId);
              break;
          case -1:  // CAS: sauce disliked
              newValues.usersDisliked.push(userId);
              break;
          case 0:  // CAS: Annulation du like/dislike
              if (newValues.usersLiked.includes(userId)) {
                  // si on annule le like
                  const index = newValues.usersLiked.indexOf(userId);
                  newValues.usersLiked.splice(index, 1);
              } else {
                  // si on annule le dislike
                  const index = newValues.usersDisliked.indexOf(userId);
                  newValues.usersDisliked.splice(index, 1);
              }
              break;
      };
       // Calcul du nombre de likes / dislikes
       newValues.likes = newValues.usersLiked.length;
       newValues.dislikes = newValues.usersDisliked.length;
       // Mise à jour de la sauce avec les nouvelles valeurs
       Thing.updateOne({ _id: sauceId }, newValues )
           .then(() => res.status(200).json({ message: 'Sauce notée !' }))
           .catch(error => res.status(400).json({ error }))  
   })
   .catch(error => res.status(500).json({ error }));
}

