import '../styles/ongoing.css'
import useThemeContext from '../context/ThemeContext'
import { useEffect, useState } from 'react';
import useApiContext from '../context/ApiContext';
import { getCurrentSeason, convertTime } from '../utilities/utility'
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import PageLoader from '../components/Pageloader'
import { Helmet } from 'react-helmet';

const OngoingPage = () => {
    const [ newSeason, setNewSeason ] = useState([]);
    const { theme } = useThemeContext();
    const { fetchNewSeason, getUpdate, updatItemNewSeason } = useApiContext();

    const currentSeason = getCurrentSeason();
    const currentYear = new Date().getFullYear()

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetchNewSeason();
            // console.log('Latest Ongoing', response);    
            if (response) {
                const clean = response.filter(item => 
                    item.status === 'RELEASING' &&
                    item.season === 'SUMMER' && // currentSeason &&
                    item.year === currentYear
                )
                const processedData = clean.sort((a, b) => new Date(b.next) - new Date(a.next))
                setNewSeason(processedData);

                if (processedData.length > 0) {
                    const lastItem = processedData[processedData?.length - 1];
                    const nextTime = new Date(lastItem?.next).getTime() - new Date().getTime();
                  
                    if(nextTime <= 0) {
                        await updatItemNewSeason(lastItem?.slug)
                        await getUpdate('latest')
                    } else {
                        console.log(nextTime)
                        const interval = setInterval(async() => {
                            try {
                                const remainingTime = new Date(lastItem?.next).getTime() - new Date().getTime();
                                console.log('remaining time', remainingTime)
                                if (remainingTime <= 0) {
                                    await updatItemNewSeason(lastItem?.slug)
                                    await getUpdate('latest')
                                    clearInterval(interval);
                                }
                            } catch (error) {
                                console.log("setInterval", error)
                            }
                        }, nextTime); 
                    }
                }
            } else {
                setTimeout(() => {
                    fetchData();
                }, 6000)
            }
        }
        fetchData();
    }, [])

    return (
        <section className='ongoing__page'>
            <Helmet>
                <title>soma - Ongoing Anime Series </title>
                <meta 
                    name='description' 
                    content="Find the Ongoing Anime in the current season"
                />
            </Helmet>
            <div className="section__header">
                <h2>
                    Ongoing Anime Series 
                </h2>
            </div>
            {
                newSeason.length <= 0 ? (
                    <PageLoader />
                ) : (
                    <div className="container container__ongoing">
                        <h3>
                            Current Season: {"SUMMER" || currentSeason} {currentYear} (no anime for fall yet)
                        </h3>
                        <div className="ongoing__items">
                            {
                                newSeason?.map((item, index) => {
                                    const formattedTime = convertTime(item?.next);
                                    return (
                                        <div key={index} className="ongoing__item">
                                            <div className='ongoing__image'>
                                                <LazyLoadImage 
                                                    effect='blur'
                                                    src={item?.coverImage} 
                                                    alt={item?.title?.romaji || item?.title?.english} 
                                                />
                                                <div className='ongoing__title__studio'>
                                                    <h4>
                                                        <Link to={`/info/${item.id}`}>
                                                            {item.title.romaji || item.title.english}
                                                        </Link>
                                                    </h4>
                                                </div>
                                                {   
                                                    item.averageScore >= 70 ? (
                                                        <span className='ongoing__rating'>
                                                            {item.averageScore}%
                                                        </span>
                                                    ) : (
                                                        <span className={`ongoing__rating green ${!item.rating ? 'd-none' : ''}`}>
                                                            {item.averageScore}%
                                                        </span>
                                                    )
                                                }
                                            </div>
                                            <article className='ongoing__article'>
                                                <span className='ongoing__current__ep'>
                                                    EP {item?.currentEpisode + 1} airing in
                                                </span>
                                                <div className='ongoing__countdown'>
                                                    {formattedTime}
                                                </div>
                                                <div className='ongoing__description'>
                                                    <p className=''>
                                                        {item?.description}
                                                    </p>
                                                    <br />
                                                    <Link 
                                                        to={`/info/${item.slug}`}
                                                        className={theme ? 'ligh' : 'dark'}
                                                    >
                                                        Read More
                                                    </Link>
                                                </div>
                                                <ul className='ongoing__genres'>
                                                    {
                                                        item.genre.map((item, index) => {
                                                            return (
                                                                <li key={index}>
                                                                    {item}
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </article>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                )
            }
        </section>
    )
}

export default OngoingPage
