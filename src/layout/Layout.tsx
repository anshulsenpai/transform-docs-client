import React, { ReactNode, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

import userIcon from "../assests/user.png";
import profileIcon from "../assests/profile.png";
import logoutIcon from "../assests/exit.png";
import { Link, NavLink } from "react-router-dom";
import { IUser } from "../redux/authSlice";

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [profileExpand, setProfileExpand] = useState(false)
    const user = useSelector<RootState>(state => state.auth.user) as IUser;

    // const location = useLocation();

    return (
        <>
            <header className="h-14 w-full bg-black flex items-center justify-between px-10 select-none">
                <div className="header-left">
                    <h2 className="text-sm font-bold text-indigo-50 md:text-lg">SmartDrive AI</h2>
                </div>
                <div onClick={() => setProfileExpand(!profileExpand)} role="button" className="header-right cursor-pointer flex items-center">
                    <div className="profile-toggle w-10 h-10 flex justify-center items-center rounded-full p-2">
                        <img src={userIcon} alt="User Icon" />
                    </div>
                    <div className="user-details hidden md:block">
                        <h4 className="text-indigo-50 text-xs font-semibold capitalize">{user.name}</h4>
                        <h6 className="text-indigo-200 text-[9px]">{user.email}</h6>
                    </div>
                </div>
            </header>
            <main className="grid grid-cols-10">
                <aside className="hidden border w-full min-h-screen h-full col-span-2 bg-black md:block">
                    {user.role === 'user' ? <ul className="mt-5">
                        <li className="text-indigo-50 py-2 px-6 text-left mb-2 mx-2 rounded-lg hover:bg-indigo-50 hover:text-black duration-300">
                            <NavLink to={"/dashboard"}>
                                <i className="fa-solid fa-gauge mr-3"></i>
                                <span className="font-semibold">Dashboard</span></NavLink>
                        </li>
                        <li className="text-indigo-50 py-2 px-6 text-left mb-2 mx-2 rounded-lg hover:bg-indigo-50 hover:text-black duration-300">
                            <NavLink to={"/documents"}>
                                <i className="fa-solid fa-file mr-3"></i>
                                <span className="font-semibold ml-1">Documents</span></NavLink>
                        </li>
                        <li className="text-indigo-50 py-2 px-6 text-left mb-2 mx-2 rounded-lg hover:bg-indigo-50 hover:text-black duration-300">
                            <NavLink to={"/shared-docs"}>
                                <i className="fa-solid fa-share-nodes mr-3"></i>
                                <span className="font-semibold ml-1">Shared Docs</span></NavLink>
                        </li>
                    </ul> :
                        <ul className="mt-5">
                            <li className="text-indigo-50 py-2 px-6 text-left mb-2 mx-2 rounded-lg hover:bg-indigo-50 hover:text-black duration-300">
                                <NavLink to={"/admin/dashboard"}>
                                    <i className="fa-solid fa-gauge mr-3"></i>
                                    <span className="font-semibold">Dashboard</span></NavLink>
                            </li>
                            <li className="text-indigo-50 py-2 px-6 text-left mb-2 mx-2 rounded-lg hover:bg-indigo-50 hover:text-black duration-300">
                                <NavLink to={"/admin/documents"}>
                                    <i className="fa-solid fa-file mr-3"></i>
                                    <span className="font-semibold ml-1">Documents</span></NavLink>
                            </li>
                            <li className="text-indigo-50 py-2 px-6 text-left mb-2 mx-2 rounded-lg hover:bg-indigo-50 hover:text-black duration-300">
                                <NavLink to={"/admin/shared-documents"}>
                                    <i className="fa-solid fa-share-nodes mr-3"></i>
                                    <span className="font-semibold ml-1">Shared Documents</span></NavLink>
                            </li>
                        </ul>
                    }
                </aside>
                <div className="w-full col-span-10 py-5 p-2 md:px-4 md:col-span-8">
                    {children}
                </div>
            </main>
            {profileExpand && <div className="toggle-container w-48 bg-white px-2 py-2 absolute right-2 top-14 shadow-lg rounded">
                <div className="flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-lg mb-1">
                    <img className="w-3" src={profileIcon} alt="Logout Icon" />
                    <Link className="text-xs font-semibold p-0 m-0 hover:text-indigo-900" to="/profile">Profile</Link>
                </div>
                <div className="flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-lg mb-1">
                    <img className="w-3" src={logoutIcon} alt="Logout Icon" />
                    <Link className="text-xs font-semibold p-0 m-0 hover:text-indigo-900" to="/logout">Logout</Link>
                </div>
            </div>}
        </>
    );
};

export default Layout;
