
import {
    Player,
    BigPlayButton,
    LoadingSpinner,
    ControlBar,
    ReplayControl,
    ForwardControl,
    VolumeMenuButton,
    PlaybackRateMenuButton,
} from "video-react"
import "video-react/dist/video-react.css";
import HLSSource from "./HLSSource";
import QualityButton from "./QualityButton";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useApiContext from "../context/ApiContext";
import { BsBookmarkStar, BsBookmarkStarFill } from 'react-icons/bs'
import useAuthContext from "../context/AuthContext";


const VideoPlayer = ({ onVideoEnd, animeResult}) => {
    const [ isBookmarked, setIsBookmarked ] = useState(false)
    const [ videoSource, setVideoSource ] = useState(``)
    const [ currentQuality, setCurrentQuality ] = useState();
    const [ quality, setQuality ] = useState([]);
    const [ fetchEnimeEpisode, setFetchEnimeEpisode ] = useState(false)
    const [ qualityLoading, setQualityLoading ] = useState(true);
    const { episodeId } = useParams();
    const { getSource, fetchWatchSource } = useApiContext();
    const { addBookmark, removeBookmark, user } = useAuthContext();
    const videoRef = useRef(null);

    const fetchSource = async () => {
        const response = await getSource(animeResult.sources[0].id);
        if (!response) alert('Video Link is Broken');
        setVideoSource(response.data.url)
    }

    useEffect(() => {
        if (user && user.bookmarked && user.bookmarked.some(item => item.slug === animeResult?.anime?.slug)) {
            setIsBookmarked(true);
        } else {
            setIsBookmarked(false);
        }
    }, [animeResult, user?.bookmarked]);

    const handleAddBookmark = () => {
        if (user && animeResult?.anime.slug ) {
            if (isBookmarked) {
                removeBookmark(animeResult?.anime.slug);
            } else {
                addBookmark(animeResult?.anime?.slug, animeResult?.anime.title?.english, animeResult?.anime?.coverImage, animeResult?.anime?.episodes?.length);
            }
        } else {
            alert('Hey there guest! You need to login first to bookmark this')
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetchWatchSource(episodeId);
            // console.log('response', response)
            if (response) {
                setQuality(response);
                setQualityLoading(false)
                // check the response if there are sources
                const sortedSources = response?.sources?.sort((a, b) => {
                    if (a.quality === '1080p') {
                        return -1;
                    }
                    if (b.quality === '1080p') {
                        return 1;
                    }
                    const qualityOrder = ['720p', '480p', '360p', 'backup', 'default'];
                    const indexA = qualityOrder.indexOf(a.quality);
                    const indexB = qualityOrder.indexOf(b.quality);
                    return indexA - indexB;
                });
                const findQuality = sortedSources?.find(
                    (source) =>
                        source.quality === '1080p'  ||
                        source.quality === '720p'   ||
                        source.quality === '480p'   ||
                        source.quality === '360p'   ||
                        source.quality === 'backup' ||
                        source.quality === 'default' 
                );
                if (findQuality) {
                    setVideoSource(findQuality?.url);
                    setCurrentQuality(findQuality?.quality);
                } else {
                    fetchSource();
                    setFetchEnimeEpisode(true);
                }  
            } else {
                console.log('error', response)
                fetchSource();
                setFetchEnimeEpisode(true);
            }
        };
        fetchData();
    }, [episodeId]);

    const handleQualityChange = (option) => {
        console.log("Selected quality:", option);
        setVideoSource(option.url)
        setCurrentQuality(option.quality)
    };


    // handle video end
    useEffect(() => {
        const videoElement = videoRef.current.video.video;
        const handleTimeUpdate = () => {
            if ( videoElement.currentTime >= videoElement.duration) {
                if (onVideoEnd) {
                    // setIsFullScreen(false);
                    onVideoEnd();
                }
            }
        };

        videoElement.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, [onVideoEnd]);

    return (
        <>
            <Player 
                ref={videoRef} 
                autoPlay={false} 
                playsInline
            >
                <HLSSource src={videoSource}/>
                <BigPlayButton position="center" />
                <LoadingSpinner />
                <ControlBar >
                    
                    <PlaybackRateMenuButton rates={[2, 1.5, 1, 0.5, 0.1]}/>
                    <ReplayControl seconds={5} order={2.1} />
                    <VolumeMenuButton vertical />
                    <ForwardControl seconds={96} order={3.1} />
                    <QualityButton 
                        order={7}
                        options={quality.sources} 
                        onChange={handleQualityChange}
                        currentQuality={currentQuality}
                        fetchEnimeEpisode={fetchEnimeEpisode}
                        qualityLoading={qualityLoading}
                    />
                </ControlBar>
            </Player>
            <div className="stream__header">
                {
                    isBookmarked 
                    ? <BsBookmarkStarFill 
                        className="bookmark" 
                        title="Marked as Bookmarked"
                        onClick={handleAddBookmark}
                    />  
                    : <BsBookmarkStar 
                        className="bookmark"  
                        title="Add to Bookmark"
                        onClick={handleAddBookmark}
                    />
                }
            </div>
            
        </>
    )
}

export default VideoPlayer