import { useEffect } from 'react'
import { logout } from '../../redux/authSlice'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Input/Loader/Loader';

function Logout() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(logout());
        navigate("/");
    }, [])

    return (
        <div>
            <Loader />
        </div>
    )
}

export default Logout