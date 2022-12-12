
import { storage } from "./config/firebase.config";
import { useStateValue } from "../context/stateProvider";

import { BiCloudUpload } from "react-icons/bi";
import { MdDelete } from "react-icons/md";

import {
  getAllAlbums,
  getAllArtists,
  getAllSongs,
  saveNewAlbum,
  saveNewArtist,
  saveNewSong,
} from "../api";
import { actionType } from "../context/reducer";
import { useEffect, useState } from "react";
import FilterButton from "./FilterButton";
import { deleteAnObject, filterByLanguage, filters } from "../utils/supportfunctions";
import { deleteObject, getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { motion } from "framer-motion";

//import AlertSuccess from "./AlertSuccess";
//import AlertError from "./AlertError";

const DashboardNewSong = () => {
  const [songName, setSongName] = useState("")
  const [songImageCover, setSongImageCover] = useState(null)

  
 
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [{artists,allAlbums,artistFilter, albumFilter, filterTerm ,languageFilter},dispatch]=useStateValue()
  
  const [audioImageCover,setAudioImageCover]=useState(null)
  const [audioUploadingProgress,setAudioUploadingProgress]=useState(0)
  const[isAudioLoading,setIsAudioLoading]=useState()
  
  
  
  useEffect(()=>{
      if(artists){
        getAllArtists().then(data=>{
          dispatch({
            type:actionType.SET_ALL_ARTISTS,
            artists:data.artist
          })
        })
     }
    if(!allAlbums){
      getAllAlbums().then(data=>{
        dispatch({
          type:actionType.SET_ALL_ALBUMS,
          allAlbums:data.album
        })
      })
     }
  },[])

  const deleteFileObject = (url,isImage)=>{
    if(isImage){
      setIsImageLoading(true)
      setIsAudioLoading(true)
    }
    const deleteRef = ref(storage,url);
    deleteObject(deleteRef).then(()=>{
      setSongImageCover(null);
      setAudioImageCover(null)
      setIsImageLoading(false)
      setIsAudioLoading(false)
    })
  }

  const saveSong = ()=>{
    if(songImageCover || !audioImageCover) {
        //throw alert
    }else{
      setIsAudioLoading(true)
      setIsImageLoading(true)
      const data={
        name:songName,
            imageURL:songImageCover,
            songUrl:audioImageCover,
            album:albumFilter,
            artist:artistFilter,
            language:languageFilter,
            category:filterTerm
      }
      saveNewSong(data).then(res=>{
        getAllSongs().then(songs=>{
          dispatch({
            type:actionType.SET_ALL_SONGS,
            getAllSongs:songs.song
          })
        })
      })
      setSongName(null)
      setIsAudioLoading(false)
      setIsImageLoading(false)
      setSongImageCover(null)
      setAudioImageCover(null)
      dispatch({ type:actionType.SET_ALBUM_FILTER,artistFilter:null})
      dispatch({ type:actionType.SET_LANGUAGE_FILTER,languageFilter:null})
      dispatch({ type:actionType.SET_ALBUM_FILTER,albumFilter:null})
      dispatch({ type:actionType.SET_FILTER_TERM,filterTerm:null})
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 border border-gray-300 gap-4 rounded-md">DashboardNewSong
   <input
   type="text"
   placeholder="enter your song name"
   className="w-full p-3 rounded-md text-base font-semibold text-textColor outline-none shadow-sm border border-gray-300 bg-transparent"
   value={songName}
   onChange={(e)=>setSongName(e.target.value)}
   />
    
    <div className="flex w-full justify-between flex-wrap items-center gap-4">
     <FilterButton filterData={artists} flag={"Artist"} />
     <FilterButton filterData={allAlbums} flag={"Album"} />
     <FilterButton filterData={filterByLanguage} flag={"Language"} />
     <FilterButton filterData={filters} flag={"Category"} />
    </div>
    <div className="bg-card backdrop-blur-md w-full h-300 rounded-md border-2 border-dotted border-gray-300 cursor-pointer ">
    {isImageLoading && <FileLoader progress={imageUploadProgress}/>}
    
    {!isImageLoading &&(
      <>
      {!songImageCover ? (
        <FileUploader updateState={setSongImageCover}
        setProgress = {setImageUploadProgress}
        isLoading = {setIsImageLoading}
        isImage={true}
        />

      ) :(
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-md">
          <img src={songImageCover}
          classname="w-full h-full object-cover"
          alt=""/>
              <button
                        type="button"
                        className="absolute bottom-3 right-3 p-3 rounded-full bg-red-500 text-xl cursor-pointer outline-none hover:shadow-md  duration-500 transition-all ease-in-out"
                         onClick={() => {
                           deleteFileObject(songImageCover ,"images");
                         }}
                      >
                        <MdDelete className="text-white" />
                      </button>         

        </div>
      )}
      </>
    )}    
    </div>

    {/*audio*/}
    <div className="bg-card backdrop-blur-md w-full h-300 rounded-md border-2 border-dotted border-gray-300 cursor-pointer ">
    {isAudioLoading && <FileLoader progress={audioUploadingProgress}/>}
    
    {!isAudioLoading &&(
      <>
      {!audioImageCover ? (
        <FileUploader updateState={setAudioImageCover}
        setProgress = {setAudioUploadingProgress}
        isLoading = {setIsAudioLoading}
        isImage={false}
        />

      ) :(
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-md">
          
          <audio src={audioImageCover} controls></audio>
              <button
                        type="button"
                        className="absolute bottom-3 right-3 p-3 rounded-full bg-red-500 text-xl cursor-pointer outline-none hover:shadow-md  duration-500 transition-all ease-in-out"
                         onClick={() => {
                           deleteFileObject(audioImageCover ,false);
                         }}
                      >
                        <MdDelete className="text-white" />
                      </button>         

        </div>
      )}
      </>
    )}    
    </div >
    <div className="flex items-center justify-center w-60 cursor-pointer p-4">
      {isImageLoading ||  isAudioLoading ? (
          <DisabledButton/>
     

      ):(
        <motion.button whileTap={{scale:0.75}}
        className="px-8 py-2 rounded-md text-white bg-red-600 hover:shadow-lg" onClick={saveSong}>
              Save song

        </motion.button>
      )}


    </div>

    </div>
  )
}

export const DisabledButton = ()=>{
  return(
    <div>
    <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
  <svg aria-hidden="true" class="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path></svg>
  Buy now
</button>
<button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
    Choose plan
    <svg aria-hidden="true" class="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
</button>
</div>
  )
}

export const FileLoader = ({progress})=>{
  return(
    <div className="w-full h-full flex flex-col items-center justify-center">
      <p className="text-xl font-semibold text-textColor">
        {Math.round(progress) > 0 && <>{`${Math.round(progress)}%`}</>}
      </p>
      <div className="w-20 h-20 min-w-[40px] bg-red-600  animate-ping  rounded-full flex items-center justify-center relative">
        <div className="absolute inset-0 rounded-full bg-red-600 blur-xl "></div>
      </div>
    </div>
  )
}

export const FileUploader =({ updateState,setProgress,isLoading ,isImage})=>{
  
  const uploadFile = (e)=>{
    isLoading(true);
    const uploadedFile= e.target.files[0];
    const storageRef = ref(storage,`${isImage ? "images":"audios"}/${Date.now()}-${uploadedFile.name}`)
    const uploadTask =  uploadBytesResumable(storageRef,uploadedFile)
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error)=>{console.log(error)},
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
            updateState(downloadURL)
            isLoading(false)
        })
      }
      )
  }
  return (
    <label>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col justify-center items-center cursor-pointer">
          <p className="font-bold text-2xl">
            <BiCloudUpload />
          </p>
          <p className="text-lg">
            click to upload {isImage ? "image" : "audio"}
            
          </p>
        </div>
        
      </div>
      <input
        type="file"
        name="upload-image"
        accept={`${isImage ? "image/*" : "audio/*"}`}
     onChange={uploadFile}
        className="w-0 h-0"
      />
    </label>
  );
};


export default DashboardNewSong

