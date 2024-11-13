'use client';
// trying it out
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Footer from '../components/footer'; // Import the Footer component

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
            {/* Hero Section with Video Background */}
            <section className="relative w-full h-screen">
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                >
                    <source src="/assets/images/PulseCheck.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                    <motion.h1
                        className="text-6xl text-white font-bold mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        Welcome to PulseCheck
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-200 mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                    >
                        A simple and elegant student feedback website to improve your courses
                    </motion.p>
                    <motion.button
                        onClick={handlePulseCheckClick}
                        className="px-8 py-3 bg-yellow-500 text-black rounded-lg text-lg font-semibold hover:bg-yellow-400 transition"
                        animate={{ scale: [1.5, 1.05, 1] }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            repeatType: 'loop',
                            ease: 'easeInOut',
                        }}
                    >
                        Ready, Set, Feedback!
                    </motion.button>
                </div>
            </section>

            {/* Stats / Logos Section */}
            <section className="py-12 bg-gray-100 flex flex-col items-center">
                <h2 className="text-4xl font-semibold text-center mb-8 text-black-400">Students and Faculty from These Universities Use Our Website!</h2>
                <div className="flex space-x-8">
                    <Image src="/assets/images/slu-primary-blue-rgb.png" alt="University 1" width={150} height={50} />
                    <Image src="/assets/images/slu-primary-blue-rgb.png" alt="University 2" width={150} height={50} />
                    <Image src="/assets/images/slu-primary-blue-rgb.png" alt="University 3" width={150} height={50} />
                </div>
            </section>

            {/* Features Section */}
            <section className="mt-12 px-6">
                <h2 className="text-4xl font-semibold text-center mb-8">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="p-6 border rounded-lg shadow-md bg-white flex flex-col items-center hover:shadow-lg transition-shadow duration-300"
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
                                    className="mb-4"
                                />
                            )}
                            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-center text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="mt-12 px-6">
                <h2 className="text-4xl font-semibold text-center mb-8">What Users Are Saying</h2>
                <motion.div
                    className="flex space-x-6 overflow-x-auto scrollbar-hide"
                    whileTap={{ cursor: "grabbing" }}
                >
                    {testimonials.map((testimonial, index) => (
                        <motion.blockquote
                            key={index}
                            className="p-6 border-l-4 border-gray-500 bg-gray-100 flex-1 min-w-[300px] rounded-lg shadow-md"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <p className="italic text-lg">"{testimonial.quote}"</p>
                            <cite className="block mt-4 font-bold text-gray-800">- {testimonial.author}</cite>
                        </motion.blockquote>
                    ))}
                </motion.div>
            </section>

            {/* CTA Section */}
            <motion.section
                className="my-12 py-24 bg-yellow-500 text-center text-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <h3 className="text-3xl font-semibold mb-6">Join PulseCheck Today</h3>
                <p className="text-xl mb-6">Enhance your course effectiveness with real-time feedback from your peers and instructors.</p>
                <motion.button
                    onClick={handlePulseCheckClick}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-700 transition"
                >
                    Ready, Set, Feedback!
                </motion.button>
            </motion.section>

            {/* Include Footer */}
            <Footer />
        </div>
    );
}
