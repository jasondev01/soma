import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import LoaderBox from './LoaderBox';
import useApiContext from '../context/ApiContext';
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Pagination, Autoplay, EffectFade } from 'swiper';
import '../styles/hero.css'
import { removeDuplicates } from '../utilities/utility';


const Hero = () => {
    const [ data, setData ] = useState([]);
    const [ pageLoad, setPageLoad ] = useState(false);
    const { fetchHero } = useApiContext()

    // const progressCircle = useRef(null);
    // const progressContent = useRef(null);
    // const onAutoplayTimeLeft = (s, time, progress) => {
    //     progressCircle.current.style.setProperty('--progress', 1 - progress);
    //     progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
    // };
    
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetchHero();
            // console.log('Hero Section', response)
            if(response) {
                setPageLoad(true);
                const clean = response.filter(clean => clean?.slug !== 'mushoku-tensei:-jobless-reincarnation-season-2') 
                const processed = removeDuplicates(clean);
                // console.log('hero', processed)
                setData(processed);
            } else {
                setTimeout(() => {
                    fetchData();
                }, 6000)
            }
        }
        fetchData();
        setPageLoad(false);
    }, [])

    // console.log("Banner Info", info);
    const sortedData = [...data].sort((a, b) => b.averageScore - a.averageScore)
    return (
        <>
            <section id='hero' className='hero'>
            {
                !pageLoad ? (
                    <LoaderBox />
                ) : (
                    <Swiper
                        autoplay={{
                            delay: 10000,
                            disableOnInteraction: false,
                        }}
                        effect={'fade'}
                        pagination={{
                            dynamicBullets: true,
                            clickable: true
                        }}
                        modules={[Autoplay, Pagination, EffectFade]}
                        // onAutoplayTimeLeft={onAutoplayTimeLeft}
                    >
                        {
                            sortedData?.slice(0, 10)?.map((item, index) => {
                                const matchEpisode = item.episodes?.find(ep => ep.number === item?.currentEpisode)
                                const episodeId = matchEpisode?.id
                                return (
                                    <SwiperSlide
                                        style={{
                                            backgroundImage: `url(${"https://cors.zimjs.com/" + item?.bannerImage})`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: 'cover',
                                            height: '100%!important',
                                            // position: 'relative'
                                        }} 
                                        key={index}
                                    >
                                        <LazyLoadComponent>
                                            <div className="container container__hero" >
                                                <article className='anime__hero__info'>
                                                    <span className='random__tag'>
                                                        TOP AIRING
                                                    </span>
                                                    <div className='anime__hero__title'>
                                                        <h3>
                                                            {item?.title?.english || item?.title?.romaji}
                                                    
                                                        </h3>
                                                        <ul className='anime__status__episodes'>
                                                            <li>
                                                                { item?.year }
                                                            </li>
                                                            <li>
                                                                { 
                                                                    item.format === "MOVIE" 
                                                                    ? "Movie"
                                                                    : item.status === 'RELEASING' ? 'Ongoing' : `${item.status}`
                                                                }
                                                            </li>
                                                                {   
                                                                    item?.format === "TV" 
                                                                    ? `Episode: ${item.currentEpisode } `
                                                                    : item?.format
                                                                }
                                                        </ul>
                                                    </div>
                                                    <p>
                                                        { item.description }
                                                    </p>
                                                    <div className='hero__butons'>
                                                        {
                                                            episodeId ? (
                                                                <Link to={`/watch/${item?.slug}/${item?.currentEpisode}/${episodeId}`} 
                                                                    className='btn btn-primary'
                                                                >
                                                                    Watch Now
                                                                </Link>
                                                            ) : (
                                                                <button
                                                                    className='btn btn-primary'
                                                                    disabled
                                                                >
                                                                    Loading...
                                                                </button>
                                                            )
                                                        }
                                                        <Link to={`/info/${item?.slug}`} className='btn'>
                                                            Read Info
                                                        </Link>
                                                    </div>
                                                    
                                                </article>
                                                <div className='anime__hero__cover'>
                                                    <LazyLoadImage
                                                        effect='blur' 
                                                        src={`https://cors.zimjs.com/${item.coverImage}`} 
                                                        alt={item?.title?.romaji} 
                                                    />
                                                </div>
                                            </div>
                                        </LazyLoadComponent>
                                    </SwiperSlide>
                                )
                            })
                        }
                        {/* <div className="autoplay-progress" slot="container-end">
                            <svg viewBox="0 0 48 48" ref={progressCircle}>
                                <circle cx="24" cy="24" r="20"></circle>
                            </svg>
                            <span ref={progressContent}></span>
                        </div> */}
                    </Swiper>
                )
            }
            </section>
        </>
    )
}

export default Hero
