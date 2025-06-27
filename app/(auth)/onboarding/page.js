"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { userCreationAndOnboarding } from "@/features/auth";
import { onboardingFormSchema } from "@/zodSchemas/onBoardingFormSchema";

function OnboardingPage() {
    const router = useRouter();
    const form = useForm({ resolver: zodResolver(onboardingFormSchema) });

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = form;

    const onSubmitForm = async (data) => {
        const { errors, data: succuss } = await userCreationAndOnboarding(data);
        if (errors) {
            const normalizedErrors = Array.isArray(errors) ? errors : [errors];
          
            normalizedErrors.forEach((error) => {
              const field = error.path ?? "root"; // fallback if `path` is undefined
              setError(field === "root" ? "subdomain" : field, {
                type: "manual",
                message: error.message || "Something went wrong",
              });
            });
        }
          

        if (succuss) {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-background">
            <form
                onSubmit={handleSubmit(onSubmitForm)}
                className="w-full max-w-xl rounded-2xl border border-border bg-white/90 dark:bg-muted/70 backdrop-blur p-8 shadow-xl space-y-6"
            >
                {/* Header */}
                <div className="text-center space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        🚀 Create Your Website
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Start by filling the form below
                    </p>
                </div>

                {/* Name Field */}
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="name">Website Name</Label>
                    <Input id="name" type="text" {...register("name")} />
                    {errors.name && (
                        <p className="text-sm text-red-500">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Subdomain Field */}
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <div className="relative">
                        <Input
                            id="subdomain"
                            type="text"
                            {...register("subdomain")}
                            className="pr-20"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            .yourdomain.com
                        </span>
                    </div>
                    {errors.subdomain && (
                        <p className="text-sm text-red-500">
                            {errors.subdomain.message}
                        </p>
                    )}
                </div>

                {/* Description Field */}
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" {...register("description")} />
                    {errors.description && (
                        <p className="text-sm text-red-500">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-32"
                    >
                        {isSubmitting ? "Loading..." : "Create Site"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default OnboardingPage;
