(function(){
  const STORAGE_KEY = 'minergyUserAvatar';
  const defaultAvatar = document.querySelector('.app-header__avatar')?.dataset.defaultAvatar || 'https://i.pravatar.cc/100?img=12';
  const storedAvatar = localStorage.getItem(STORAGE_KEY);
  const avatarUrl = storedAvatar || defaultAvatar;

  const setAvatar = (url) => {
    document.querySelectorAll('.app-header__avatar').forEach(img => {
      img.src = url;
      img.dataset.defaultAvatar = defaultAvatar;
    });
  };

  setAvatar(avatarUrl);
  if(!storedAvatar){
    localStorage.setItem(STORAGE_KEY, avatarUrl);
  }
})();
