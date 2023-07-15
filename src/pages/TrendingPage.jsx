import { useEffect, useState } from "react"
import TrendingContent from "../components/TrendingContent"
import useApiContext from "../context/ApiContext"
import "../styles/trendingpage.css"
import Pageloader from "../components/Pageloader"
import PaginationButtons from "../components/PaginationButtons"
import { LazyLoadImage } from "react-lazy-load-image-component"

const TrendingPage = () => {
    const [ data, setData ] = useState();
    const [ pageLoad, setPageLoad ] = useState(false);
    const [ pageNumber, setPageNumber ] = useState(1);
    const { fetchTrendingPage } = useApiContext();
    
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetchTrendingPage(pageNumber);
            // console.log('Trending Page', response)
            if (response) {
                setPageLoad(true);
                setData(response);
            } else {
                setTimeout(() => {
                    setPageLoad(false);
                    fetchData();
                }, 6000)
            }
        }
        fetchData();
        setPageLoad(false);
    }, [pageNumber])

    if(!pageLoad) {
        return <Pageloader />
    }

    const handlePageClick = (page) => {
        setPageNumber(page);
    };

    return (
        <section className="trending__page">
            <h2>Trending Anime</h2>
            <div className="container container__trending__page">
                {
                    data &&
                    data.map((item, index) => {
                        const embed = "https://www.youtube.com/embed"
                        const baseUrl = "https://www.youtube.com/watch?v="
                        return (
                            <div key={index} className="trending__item">
                                <div className="trending__item__image">
                                    <LazyLoadImage 
                                        effect='blur' 
                                        src={item?.image} 
                                        alt={item?.title?.romaji} 
                                        height={100} 
                                        width={100} 
                                    />
                                </div>
                                <TrendingContent item={item} baseUrl={baseUrl}/> 
                                <div 
                                    className="trending__item__trailer"
                                >
                                    <iframe
                                        className="trending__item__iframe"
                                        width="100%" height="330" 
                                        src={`${embed}/${item.trailer?.id}`} 
                                        title="YouTube video player" 
                                        allowFullScreen 
                                    />
                                </div>
                            </div>
                        )
                    })
                }
                <div className="pagination">
                    <PaginationButtons handlePageClick={handlePageClick} pageNumber={pageNumber}/>
                </div>
            </div>
            
        </section>
    )
}

export default TrendingPage
