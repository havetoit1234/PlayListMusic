
var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
const PLAY_STORAGE = 'Zing-Mp3';
var playlist = $('.playlist');
var cd = $('.cd');
var heading = $('header h2');
var cd_cdthum = $('.cd .cd-thumb');
var audio = $('#audio');
var btnPlay = $('.btn-toggle-play');
var player = $('.player');
var progress = $('#progress');
var btnNext = $('.btn-next');
var btnPrev =$('.btn-prev');
var btnRandom = $('.btn-random');
var btnrepeat = $('.btn-repeat');


const app = {
    CurrentIndex: 0,
    isplaying : false,
    isRandom : false,
    isRepeact : false,
    isActive : false,
    config : JSON.parse(localStorage.getItem("PLAY_STORAGE")) || {},
    songs : [
        {
            name : 'Cưa là Đổ',
            singer : 'Phát Hồ X2X',
            picture : './image/cualado.jpg',
            path : './songs/cualado.mp3'
        },
        {
            name : 'Cưới Thôi',
            singer : 'MasNew',
            picture : './image/cuoithoi.jpg',
            path : './songs/cuoithoi.mp3'
        },
        {
            name : 'Demon',
            singer : 'Demon',
            picture : './image/demon.jpg',
            path : './songs/demon.mp3'
        },
        {
            name : 'Hero x Cars',
            singer : 'Hero',
            picture : './image/hero.jpg',
            path : './songs/hero.mp3'
        },
        {
            name : 'Như một người dưng',
            singer : 'Hồng Gấm',
            picture : './image/Nhumotnguoidung.jpg',
            path : './songs/nhunguoidung.mp3'
        },
        {
            name : 'Yêu đi đừng sợ',
            singer : 'Hồng Gấm',
            picture : './image/yeudidungso.jpg',
            path : './songs/yeudungso.mp3'
        },
        {
            name : 'Xin Đừng Lặng Im ',
            singer : 'SoBin Hoàng Sơn',
            picture : './image/xindunglangim.jpg',
            path : './songs/xindunglangim.mp3'
        }
        
    ],
    setConfig : function(key ,value){
        this.config[key] = value ;
        localStorage.setItem("PLAY_STORAGE", JSON.stringify(this.config));
    },
    render : function(){
        var html = this.songs.map((song , index) =>{
            return `
            <div class="song ${index === this.CurrentIndex ? 'active':''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.picture}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = html.join('');
    },
    
    // định nghĩa ra phương thức mới ở đaây là định nghĩa ra bài hát hiện tại
    defineProperties : function(){
        Object.defineProperty(this,'currentSong',{
            get : function(){
                return this.songs[this.CurrentIndex];
            }
        })
        
    },
    handelEvent : function(){ 
        // Xử lí phóng to thu nhỏ CD
        var cdWidth = cd.offsetWidth;
        document.onscroll = function(){ 
            var scrollScreen = window.scrollY || document.documentElement.scrollTop;
            var newWidth = cdWidth - scrollScreen;  
            cd.style.width = newWidth + 'px' ;
            cd.style.opacity = newWidth/cdWidth; 
        }
        // Xử lí quay CD
        const cdAmination = cd_cdthum.animate([ 
            {transform : 'rotate(360deg)'} 
            ],
            {   duration : 10000, 
                iterations : Infinity 
        })
        cdAmination.pause();   
        // Xủ lí phát nhạc (Play audio)
        var _this = this;
         btnPlay.onclick = ()=>{
            if(_this.isplaying){
                audio.pause();
            }
            else{
                audio.play();
            }
            
        }
        // Khi Song Được Play
        audio.onplay = function (){
            _this.isplaying = true;
            player.classList.add('playing');
            cdAmination.play();
        }
        // Khi Song bị Pause
        audio.onpause = function (){
            _this.isplaying = false;
            player.classList.remove('playing');
            cdAmination.pause();
        }
        // Khi tiến độ bài hát thây đổi 
        audio.ontimeupdate = function(){
            let progressPencent ;
            if(audio.duration){              
                progressPencent = Math.floor(audio.currentTime/audio.duration * 100); 
                progress.value = progressPencent; 
            }
        }    
        // Xử lí chuyển bài hát khi hát hết bài
        audio.onended = ()=>{
            if(_this.isRepeact === false ){
                if(_this.isRandom){
                    _this.RamdomSong();
                }else{
                    _this.nextSong();           
                }    
            }else{
                _this.repeatSong();
            }
            _this.render();   
            audio.play();
        }
        // Xử lí khi tua bài hát 
        progress.onchange = (e)=>{
            const seeTime = audio.duration /100 * e.target.value; // tính ra vị trí của bài hát khi ta kéo thanh Progrees
            audio.currentTime = seeTime;
        }
        // xử lí khi random
        btnRandom.onclick = function(){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            btnRandom.classList.toggle('active', _this.isRandom);
        }
        // Khi Next bài Hát
        btnNext.onclick = ()=>{
            if(_this.isRandom){
                _this.RamdomSong();
            }else{
                _this.nextSong();
                _this.scrollToActiveSong();           
            }
            audio.play();
            _this.render();
            
        }
        // Khi lùi bài hát 
        btnPrev.onclick = ()=>{
            if(_this.isRandom){
                _this.RamdomSong();
            }else{
                _this.prevSong();
                _this.scrollToActiveSong();          
            }
            audio.play();
            _this.render();
            
        }
        // Khi Repeact bài hát
        btnrepeat.onclick = ()=>{
            _this.isRepeact = !_this.isRepeact;
            _this.setConfig('isRepeact', _this.isRepeact);
            btnrepeat.classList.toggle('active', _this.isRepeact);
        }
        // Khi active một bài hát bất kì
        playlist.onclick = function(e){
            var songNode = e.target.closest('.song:not(.active)'); //closest sẽ trả về element chính nó hoặc ccon nó nếu không tìm thấy thì nó sẽ trả về null
            var songOption = e.target.closest('.option');
            // e.target sẽ trả về giá trị mà t click vào ngay chỗ đó
            // nếu phần tử element mà ta click vào ... kiểm tra xem có tìm thấy element song hoặc con của element song không có class active hay không ?
            if(songNode || songOption ){ 
               if(songNode){ 
                _this.CurrentIndex = Number(songNode.dataset.index); // === songNode.getAttribute('data-index');
                _this.loadCurrentSong();
                _this.render();
                audio.play();
               }
               if(songOption){
                    //ử lí code khi ta click vào option
               }
            }  
        }
    },
    // Load Config
    loadConfig : function(){ // Cách 1 
        this.isRandom = this.config.isRandom;
        this.isRepeact = this.config.isRepeact;
        this.isActive = this.config.isActive;
       /*  Object.assign(this , this.config){ // cách 2
        } */

    },
    // Repect Song
    repeatSong : function (){
            this.CurrentIndex = this.CurrentIndex;
            this.loadCurrentSong();
    },
    // Ramdom Song
    RamdomSong : function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex === this.CurrentIndex );
        this.CurrentIndex = newIndex;
        this.loadCurrentSong();
    },
    // Next bài hát
    nextSong : function(){
        this.CurrentIndex +=1;
        if(this.CurrentIndex >= this.songs.length){
            this.CurrentIndex = 0;
        }
            this.loadCurrentSong();     
    },
    // Lùi bài
    prevSong : function(){
        this.CurrentIndex -- ;
        if(this.CurrentIndex < 0){
            this.CurrentIndex = this.songs.length-1;
        }
            this.loadCurrentSong();
    },
    // Scroll to Active Song
    scrollToActiveSong : function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior : 'smooth',
                block : 'nearest'
            })
        },200)
    },
    // Xủ lí tải bài hát đầu tiên lên UI 
    loadCurrentSong : function(){
        heading.innerText = this.currentSong.name;
        cd_cdthum.style.backgroundImage  = `url('${this.currentSong.picture}')`;
        audio.src = this.currentSong.path;
    },
    start : function(){
        //Load cấu hình của hệ thống
        this.loadConfig();
        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();
        // Lắng nghe các event sự kiện
        this.handelEvent();
        // Load bài hát hiện tại
        this.loadCurrentSong();
        // Render ra các playlist
        this.render();
        // Hiển thị load từ localStorage
        btnRandom.classList.toggle('active', this.isRandom);
        btnrepeat.classList.toggle('active', this.isRepeact);

    }
       
}
app.start();
