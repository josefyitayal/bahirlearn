"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";
import { getCurrentUserWebsite } from "@/features/website";

// const chartData = [
//   { month: "January", desktop: 186 },
//   { month: "February", desktop: 305 },
//   { month: "March", desktop: 237 },
//   { month: "April", desktop: 73 },
//   { month: "May", desktop: 209 },
//   { month: "June", desktop: 214 },
// ]

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-1))",
    },
};

function page() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            try {
                const { errors, data } = await getCurrentUserWebsite();
                if (errors) {
                    toast(errors.message);
                }
                const website = data[0];
                if (!website) throw new Error("Website not found");

                const totalMembers = website.members.length;

                let totalPurchases = 0;
                let totalRevenue = 0;
                const revenueByMonth = {};

                for (const course of website.courses) {
                    totalPurchases += course.enrollments.length;
                    totalRevenue += course.enrollments.length * course.price;

                    for (const enrollment of course.enrollments) {
                        const month = format(
                            new Date(enrollment.createdAt),
                            "MMMM"
                        );
                        revenueByMonth[month] =
                            (revenueByMonth[month] || 0) + course.price;
                    }
                }

                const orderedMonths = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ];

                const chartData = orderedMonths
                    .filter((month) => revenueByMonth[month] !== undefined)
                    .map((month) => ({
                        month,
                        revenue: revenueByMonth[month],
                    }));

                setStats({
                    totalMembers,
                    totalPurchases,
                    totalRevenue,
                    chartData,
                });
            } catch (err) {
                console.error("Error fetching dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);

    if (loading)
        return (
            <div className="w-full h-full flex items-center justify-center text-xl">
                Loading...
            </div>
        );

    if (!stats)
        return (
            <div className="w-full h-full flex items-center justify-center text-xl">
                No data found
            </div>
        );

    return (
        <div className="flex flex-col gap-8">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardDescription className="text-muted-foreground">
                            Course Purchases
                        </CardDescription>
                        <CardTitle className="text-4xl font-semibold">
                            {stats.totalPurchases}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardDescription className="text-muted-foreground">
                            Total Revenue
                        </CardDescription>
                        <CardTitle className="text-4xl font-semibold">
                            {stats.totalRevenue} birr
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardDescription className="text-muted-foreground">
                            Total Members
                        </CardDescription>
                        <CardTitle className="text-4xl font-semibold">
                            {stats.totalMembers}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Bottom Section: Revenue Chart + Recent Members */}
            <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* Revenue Chart */}
                <Card className="flex-1 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg">Total Revenue</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Up to this day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <AreaChart
                                accessibilityLayer
                                data={stats.chartData}
                                margin={{ left: 12, right: 12 }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            indicator="dot"
                                            hideLabel
                                        />
                                    }
                                />
                                <Area
                                    dataKey="revenue"
                                    type="linear"
                                    fill="var(--color-desktop)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-desktop)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Recent Members */}
                <Card className="w-full lg:max-w-sm p-1 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center justify-between text-lg">
                            Recent Members
                            <Link
                                href="/dashboard/members"
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                See all
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-3">
                        {stats.members && stats.members.length > 0 ? (
                            stats.members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors"
                                >
                                    <Avatar>
                                        <AvatarImage src={""} />
                                        <AvatarFallback>
                                            {(member.firstName || "U")[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium">
                                        {member.firstName || "Unnamed Member"}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm px-2">
                                No members for now.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default page;
