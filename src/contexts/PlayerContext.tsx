import { createContext, useState, ReactNode, useContext } from 'react';

type Episode = {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
};

type PlayerContextData = {
  episodeList: Array<Episode>
  currentEpisodeIndex: number;
  isPlaying: boolean;
  play: (episode : Episode) => void;
  playList: (list : Episode[], index: number) => void;
  togglePlay: () => void;
  setPlaiyngState: (state : boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
  hasNext: boolean;
  hastPrevios: boolean;
  isLooping: boolean;
  toggleLoop: () => void;
  isShuffling: boolean;
  toggleShuffle: () => void;
  clearPlayerState: () => void;
};

export const PlayerContext = createContext({} as PlayerContextData);

type PlayerContextProviderProps = {
  children : ReactNode
}

export function PlayerContextProvider({children} : PlayerContextProviderProps){
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  function play(episode : Episode){
    setIsPlaying(true);
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
  }

  function playList(list: Episode[], index: number){
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
  }

  function togglePlay(){
    setIsPlaying(!isPlaying);
  }

  function toggleLoop(){
    setIsLooping(!isLooping);
  }

  function toggleShuffle(){
    setIsShuffling(!isShuffling);
  }

  function setPlaiyngState(state: boolean){
    setIsPlaying(state);
  }

  const hastPrevios = currentEpisodeIndex > 0;
  const hasNext = isShuffling || currentEpisodeIndex+1 < episodeList.length;

  function playNext(){
    if(isShuffling){
      const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length)
      setCurrentEpisodeIndex(nextRandomEpisodeIndex);
    }else if(hasNext){
      setCurrentEpisodeIndex(currentEpisodeIndex+1);
    }
  }

  function playPrevious(){
    if(hastPrevios){
      setCurrentEpisodeIndex(currentEpisodeIndex-1);
    }
  }

  
  function clearPlayerState(){
    setEpisodeList([]);
    setCurrentEpisodeIndex(0);
  }

  return (
    <PlayerContext.Provider 
      value={{episodeList, 
              currentEpisodeIndex, 
              play, 
              isPlaying, 
              togglePlay, 
              setPlaiyngState,
              playList,
              playNext,
              playPrevious,
              hasNext,
              hastPrevios,
              isLooping,
              toggleLoop,
              isShuffling,
              toggleShuffle,
              clearPlayerState
            }}
    >
      {children}
    </PlayerContext.Provider>
    );
}

export const usePlayer = () => {
  return useContext(PlayerContext);
}