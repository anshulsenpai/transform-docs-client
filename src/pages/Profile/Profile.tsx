import { useSelector } from "react-redux";
import avatarMale from "../../assests/profile.png";
import avatarFemale from "../../assests/woman.png";
import { RootState } from "../../redux/store";
import { IUser } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";

function Profile() {
    const navigate = useNavigate();
    const user = useSelector<RootState>(state => state.auth.user) as IUser;
    return (
        <div className="w-full h-[80vh]">
            <div className="flex items-center gap-4">
                {user.gender === "male" ? <img className="w-40 h-40" src={avatarMale} alt="profile icon" /> : <img className="w-40 h-40" src={avatarFemale} alt="profile icon" />}
                <div className="h-fit p-4">
                    <ul>
                        <li className="font-semibold text-sm mb-2 capitalize">{user.name}</li>
                        <li className="text-gray-600 text-sm mb-3">{user.email}</li>
                        {/* <li className="mb-2 capitalize p-0.5 px-2 bg-indigo-100 shadow text-indigo-800 w-fit text-xs font-semibold rounded-lg">{user.role}</li> */}
                        <li>
                            <button onClick={() => navigate('/logout')} className="bg-red-50 text-xs text-red-500 px-5 py-1 font-semibold rounded shadow">Logout</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Profile