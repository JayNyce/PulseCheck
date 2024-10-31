// src/components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
    const { data: session, status } = useSession();
    return (
        <nav className="bg-white shadow-md p-4">
            <div className="container mx-auto flex flex-wrap items-center justify-between">
                <Link href="/" className="flex items-center text-xl font-bold">
                    <Image
                        src="/assets/images/icon.png"
                        alt="PulseCheck Logo"
                        width={40}
                        height={40}
                        className="mr-2 object-contain"
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
