import React, { useState } from 'react';
import {useLocation, useHistory} from 'react-router-dom';

import {Header} from "@datapunt/asc-ui";
import {MenuButton, MenuInline, MenuItem} from "@datapunt/asc-ui";
import auth from "../../services/auth";

function AppHeader() {
    const location = useLocation();
    const history = useHistory();

    const [user, setUser] = useState(null);

    const menuItems = {
        Home: '/',
        Status: '/status',
        Management: '/management',
        Jobs: '/jobs',
        Dashboard: '/dashboard'
    }

    function isAdmin() {
        return auth.isAdmin();
    }

    const login = async () => {
        await auth.login();
        userInfo()
    }

    const logout = async () => {
        await auth.logout();
        setUser(null);
    }

    const userInfo = async () => {
        if (!user) {
            const userInfo = await auth.userInfo();
            setUser(userInfo)
        }
    }

    if (!isAdmin()) {
        delete menuItems.Management
    }
    userInfo()

    function isActive(pathname) {
        if (location.pathname === pathname) {
            return true
        } else {
            // Take closest match
            let activeItem = null;
            Object.entries(menuItems).forEach(([item, pathname]) => {
                if (location.pathname.startsWith(pathname) && (!activeItem || pathname.length > activeItem.item.length)) {
                    activeItem = {item: pathname}
                }
            })
            return activeItem.item === pathname
        }
    }

    function go(pathname) {
        history.push(pathname);
    }

    const navigation = (
        <MenuInline>
            {Object.entries(menuItems).map(([key, value]) => (
                <MenuItem key={key}>
                    <MenuButton onClick={() => go(value)}
                                active={isActive(value)}>
                        {key}
                    </MenuButton>
                </MenuItem>
            ))}
            <MenuItem key="gebruiker">
                <MenuButton onClick={() => user ? logout() : login()}
                            active={false}>
                    {user ? "Logout" : "Login"}
                </MenuButton>
            </MenuItem>
        </MenuInline>
    )

    return (
        <div>
            <Header title="GOB Management"
                    tall
                    navigation={navigation}
                    fullWidth/>
        </div>
    )
}

export default AppHeader;
