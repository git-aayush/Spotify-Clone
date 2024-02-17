let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // Show all the songs in the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="invert" src="assests/left-container/musiclogo.svg" alt="">
                             <div class="musicInfo">
                                 <div>${song.replaceAll("%20", " ")} </div>
                             </div>
                            <div class="playNow">
                                  <img class="invert" src="assests/right-container/play.png" alt="">
                             </div></li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector(".musicInfo").firstElementChild.innerHTML.trim())
        })
    });
    return songs;
}

// Function to play music
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "assests/right-container/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}



async function displayAlbum() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").splice(-1)[0];
            // Get the metadata of the folder;
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}"" class="card">
                                                         <div class="play">
                                                                 <svg data-encore-id="icon" role="img" aria-hidden="true" width="18px" height="18px"
                                                                   viewBox="0 0 24 24" class="Svg-sc-ytk21e-0 bneLcE">
                                                                 <path
                                                                   d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                                                                 </path>
                                                               </svg>
                                                         </div>
                                                         <img src="/songs/${folder}/cover.jpg" alt="">
                                                         <h4>${response.title}</h4>
                                                         <p>${response.description}</p>
                                                      </div> `
        }
    }
      // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}



async function main() {

    // Get the list of all songs
    await getSongs("songs/nyc")
    playMusic(songs[0], true)

    // Display all albums on the page
    displayAlbum();

    // Attach event listener to play, pause, next and previous song
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assests/right-container/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "assests/right-container/play.png"
        }
    })

    // Time duration for song
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesAndSeconds(currentSong.currentTime)} / ${secondsToMinutesAndSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Add listener to seekBar
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add Event Listener to hamBurger
    document.querySelector(".hamBurger").addEventListener("click", () => {
        document.querySelector(".leftContainer").style.left = "0"
    })

    // Add Event Listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".leftContainer").style.left = "-120%"
    })

    // Add Event Listener to previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    // Add Event Listener to next button
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    // Add Event Listener to Volume 
    volumeRange.addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Add Event Listener to mute the track
    document.querySelector(".volumeButton>img").addEventListener("click", e=>{
        console.log("changing", e.target.src)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            volumeRange.value = 0;
            currentSong.pause();
            play.src = "assests/right-container/play.png"
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.5;
            volumeRange.value = 30;
            currentSong.play()
            play.src = "assests/right-container/pause.svg"
        }
    })

}



main();