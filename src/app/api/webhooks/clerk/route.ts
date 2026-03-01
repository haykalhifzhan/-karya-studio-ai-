import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export async function POST(req: Request) {
    if (!webhookSecret) {
        throw new Error("CLERK_WEBHOOK_SECRET is not set");
    }

    if (!convexUrl) {
        throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occurred -- no svix headers", { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        const email = email_addresses[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

        try {
            // Panggil Convex mutation via HTTP
            const response = await fetch(`${convexUrl}/api/mutation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    path: "auth:createUser",
                    args: {
                        clerkId: id,
                        email: email || "",
                        name,
                        avatar: image_url || undefined,
                    },
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Convex mutation failed:", error);
                return new Response("Failed to create user", { status: 500 });
            }

            console.log("User created in Convex successfully");
        } catch (error) {
            console.error("Error calling Convex:", error);
            return new Response("Internal server error", { status: 500 });
        }
    }

    return new Response("", { status: 200 });
}