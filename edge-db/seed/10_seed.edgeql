
insert User {
  email := 'lapinbrun.user@gmail.com',
  permissions := ['PERM_USER']
};

insert User {
  email := 'lapinblond.superuser@gmail.com',
  permissions := ['PERM_USER', 'PERM_ADMIN']
};


with user := ( insert User {
    email:= 'mathiasboulay@free.fr',
    permissions:= ['PERM_USER']
  }),
  device := (insert Device {
    name := 'iphone',
    filePath := '/models/iphone.glb'
  }),
  pres := (insert Presentation {
    name:= 'Model presentation',
    owner:= user
  }),
insert PresentationDevice {
  presentation:= pres,
  device:= device,
  x := 0,
  y := 0,
  z := 0,
  yaw := 0,
  pitch := 0,
  roll := 0
};







