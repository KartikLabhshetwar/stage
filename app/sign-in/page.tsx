"use client";

import Link from "next/link";
import Image from "next/image";
import { signInWithGoogle } from "@/lib/auth-helpers";
import { GoogleLogoIcon } from "@phosphor-icons/react";

export default function SignInPage() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle("/home");
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Blue Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 relative overflow-hidden">
        {/* Abstract flowing background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Build better products with Stage
          </h2>
          <p className="text-lg text-white/90 max-w-md">
            Connect your data sources, build insights, and share them with your team.
          </p>
        </div>
      </div>

      {/* Right Column - Dark Form */}
      <div className="w-full lg:w-1/2 bg-[#0a0a0a] flex flex-col items-center justify-center p-6 sm:p-8 md:p-12">
        {/* Logo */}
        <Link href="/" className="mb-8 self-start">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Stage"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-white">STAGE</span>
          </div>
        </Link>

        {/* Form Container */}
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-8">
            Sign in to your account to continue your journey with Stage.
          </p>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors mb-6 group"
          >
            <GoogleLogoIcon className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>

          {/* Sign up link */}
          <p className="text-center text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-white hover:text-blue-400 transition-colors underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

