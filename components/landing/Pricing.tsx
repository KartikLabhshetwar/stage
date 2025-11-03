"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
});

export function Pricing() {
  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 border-t border-border bg-white">
      <div className="container mx-auto max-w-4xl">
        <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 ${instrumentSerif.className}`}>
          Pricing
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">Free</CardTitle>
              <CardDescription>
                Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-3xl font-bold">$0</p>
                <p className="text-sm text-muted-foreground">Forever free</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Basic canvas editor</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Image uploads</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Text editing</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Standard export</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/home" className="w-full">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="flex flex-col border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Pro</CardTitle>
              <CardDescription>
                For serious creators
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-3xl font-bold">$5</p>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Unlimited exports</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>High-resolution downloads</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/home" className="w-full">
                <Button className="w-full">
                  Upgrade to Pro
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}

