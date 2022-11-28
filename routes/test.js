const req = {
    body: [
        { _id: '1231235423'}, {_id: '7654'},{_id: '4'}
    ]
}
let favorites = {
    campsites: [
        '123213451235',
        '1231235423'
    ]
}

req.body.forEach(id => {
     if (favorites.campsites.includes(id._id)) {
        return;
     } 
     favorites.campsites.push(id._id)
})

console.log(favorites);