import SettingForm from "../components/SettingForm"
import background from "../assets/login.webp"
import useAuthContext from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"

const SettingPage = () => {
    const { user } = useAuthContext();
    const [ storedUser, setStoredUser ] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('User'));

        if (user || storedUser) {
            navigate('/edit-profile')
            setStoredUser(storedUser)
        } else {
            navigate('/')
        }
    }, [])


    return (
        <section className="setting__page"
            style={{
                background: `url(${background}) no-repeat`,
                backgroundSize: 'cover',
                marginTop: '0px',
                // paddingBottom: "4.4rem",
                color: 'var(--primary)',
                zIndex: '9999'
            }}
        >
             <Helmet>
                <title>Update your Profile</title>
                <meta 
                    name='description' 
                    content="Update your profile by provide URL of the image source"
                />
            </Helmet>
            <SettingForm user={user} storedUser={storedUser} />
        </section>
    )
}

export default SettingPage
