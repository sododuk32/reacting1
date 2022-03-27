import React from 'react';
import Head from 'next/head';
import AppNavbar from './AppNavbar';

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Head>
                <title>관리자</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <AppNavbar />
            <div>{children}</div>
        </>
    );
}

export default Layout;
