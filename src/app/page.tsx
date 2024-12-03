'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Footer from '../components/footer';

//
const features = [
    {
        title: "Real-Time Feedback",
        description: "Collect feedback instantly to improve course delivery and effectiveness.",
        image: '/assets/images/feedback-loop.png',
    },
    {
        title: "User-Friendly Interface",
        description: "Navigate easily with our intuitive design tailored for students and educators.",
        image: '/assets/images/user-interface.png',
    },
    {
        title: "Data Analytics",
        description: "Access comprehensive analytics to track progress and gather insights.",
        image: '/assets/images/data_analysis.png',
    },
];

const testimonials = [
    { quote: "PulseCheck transformed the way I give feedback!", author: "Student A" },
    { quote: "The real-time analytics are a game-changer for my courses.", author: "Educator B" },
    { quote: "This platform has significantly improved communication between students and teachers.", author: "Professor C" },
];

const slideIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/feedbacks');
        }
    }, [session, router]);

    const handlePulseCheckClick = () => {
        if (session) {
            router.push('/feedbacks');
        } else {
            router.push('/auth/login');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Hero Section */}
            <header className="relative w-full h-screen">
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    aria-label="Background video of PulseCheck platform"
                >
                    <source src="/assets/images/PulseCheck.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col items-center justify-center text-center px-4">
                    <motion.h1
                        className="text-5xl sm:text-6xl text-white font-extrabold tracking-tight mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        Welcome to PulseCheck
                    </motion.h1>
                    <motion.p
                        className="text-lg sm:text-xl text-gray-200 mb-6 max-w-3xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                    >
                        A simple and elegant student feedback website to improve your courses
                    </motion.p>
                    <motion.button
                        onClick={handlePulseCheckClick}
                        className="px-6 py-3 bg-yellow-500 text-black rounded-full text-lg font-medium hover:bg-yellow-400 transition focus:ring-4 focus:ring-yellow-300 shadow-lg"
                        animate={{ scale: [1.1, 1.05, 1] }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            repeatType: 'loop',
                            ease: 'easeInOut',
                        }}
                        aria-label="Get started with PulseCheck"
                    >
                        Ready, Set, Feedback!
                    </motion.button>
                </div>
            </header>

            {/* Stats Section */}
            <section className="py-16 bg-gray-100 flex flex-col items-center">
                <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-12 text-black">
                    Students and Faculty from These Universities Use Our Website!
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                    {Array(3)
                        .fill("/assets/images/slu-primary-blue-rgb.png")
                        .map((src, index) => (
                            <Image key={index} src={src} alt={`University ${index + 1} Logo`} width={150} height={50} />
                        ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="mt-16 px-6">
                <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-12">Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="p-8 border rounded-lg shadow-md bg-white flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
                            initial="hidden"
                            animate="visible"
                            variants={slideIn}
                            transition={{ duration: 0.5, delay: index * 0.3 }}
                        >
                            {feature.image && (
                                <Image
                                    src={feature.image}
                                    alt={feature.title}
                                    width={100}
                                    height={100}
                                    className="mb-6"
                                />
                            )}
                            <h3 className="text-xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                            <p className="text-center text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <motion.section
                className="my-16 py-16 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-center text-black rounded-lg shadow-lg mx-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <h3 className="text-3xl sm:text-4xl font-semibold mb-8">Join PulseCheck Today</h3>
                <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
                    Enhance your course effectiveness with real-time feedback from your peers and instructors.
                </p>
                <motion.button
                    onClick={handlePulseCheckClick}
                    className="px-6 py-3 bg-black text-white rounded-full font-medium text-lg hover:bg-gray-700 transition focus:ring-4 focus:ring-gray-500 shadow-md"
                    aria-label="Join PulseCheck now"
                >
                    Ready, Set, Feedback!
                </motion.button>
            </motion.section>

            <Footer />
        </div>
    );
}
