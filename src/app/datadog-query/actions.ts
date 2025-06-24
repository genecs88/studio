
'use server';

import { z } from 'zod';

// IMPORTANT: These keys should be stored in environment variables, not hardcoded.
// For example, process.env.DATADOG_API_KEY
const DATADOG_API_KEY = "cc4231cb76833838086b1def91af6078";
const DATADOG_APP_KEY = "34f95d5d8b1d4eecf340dafedcdcfb6ffbd446cd";

const datadogPayloadSchema = z.object({
    filter: z.object({
        query: z.string(),
        indexes: z.array(z.string()).min(1, "At least one index is required."),
        from: z.string().datetime({ message: "Invalid 'from' datetime format." }),
        to: z.string().datetime({ message: "Invalid 'to' datetime format." }),
    }),
    sort: z.string().optional(),
    page: z.object({
        limit: z.number().int().positive(),
    }),
});

export type DatadogPayload = z.infer<typeof datadogPayloadSchema>;

export async function queryDatadog(payload: DatadogPayload) {
    const validation = datadogPayloadSchema.safeParse(payload);
    if (!validation.success) {
        return { error: 'Invalid payload provided.', details: validation.error.flatten() };
    }

    try {
        const response = await fetch("https://api.datadoghq.com/api/v2/logs/events/search", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'DD-API-KEY': DATADOG_API_KEY,
                'DD-APPLICATION-KEY': DATADOG_APP_KEY,
            },
            body: JSON.stringify(validation.data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            return { error: `API Error: ${response.statusText}`, details: responseData };
        }

        return { data: responseData };
    } catch (error: any) {
        return { error: `Request failed: ${error.message}` };
    }
}
