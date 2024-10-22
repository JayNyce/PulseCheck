// src/components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image'; // Import Image from next/image

export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="bg-white shadow-md p-4">
            <div className="container mx-auto flex flex-wrap items-center justify-between">
                <Link href="/" className="flex items-center text-xl font-bold">
                    {/* Add the logo image here */}
                    <Image
                        src="/assets/images/icon.png" // Adjust the path to your image
                        alt="PulseCheck Logo"
                        width={40} // Set the width for the logo
                        height={40} // Set the height for the logo
                        className="mr-2" // Margin to the right for spacing
                    />
                    PulseCheck
                </Link>
                <button
                    className="block lg:hidden text-gray-700"
                    onClick={() => {
                        const menu = document.getElementById('mobile-menu');
                        if (menu) menu.classList.toggle('hidden');
                    }}
                >
                    ☰
                </button>
                <div id="mobile-menu" className="w-full hidden lg:flex lg:w-auto lg:space-x-4">
                    <div className="flex space-x-4 lg:ml-auto mt-4 lg:mt-0">
                        {status === 'loading' ? null : session ? (
                            <>
                                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                                    Dashboard
                                </Link>
                                {session.user.isAdmin && (
                                    <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                                        Admin Dashboard
                                    </Link>
                                )}
                                <Link href="/api/auth/signout" className="text-gray-700 hover:text-gray-900">
                                    Sign Out
                                </Link>
                            </>
                        ) : (
                            <Link href="/auth/login" className="text-gray-700 hover:text-gray-900">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
