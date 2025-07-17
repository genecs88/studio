
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

async function executeDatadogQuery(payload: DatadogPayload) {
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
            cache: 'no-store', // Ensure fresh data for each query
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


export async function findIdentifiersByReportId(initialPayload: DatadogPayload) {
    // Step 1: Find the trace_id using the report ID
    const initialResult = await executeDatadogQuery(initialPayload);

    if (initialResult.error || !initialResult.data || !initialResult.data.data || initialResult.data.data.length === 0) {
        return { 
            ...initialResult,
            finalResponse: null, 
            traceId: null, 
            error: initialResult.error || "No logs found for the given Report ID." 
        };
    }

    const firstEvent = initialResult.data.data[0];
    const traceId = firstEvent?.attributes?.attributes?.trace_id;

    if (!traceId) {
        return { 
            ...initialResult,
            finalResponse: null,
            traceId: null,
            error: "Could not find trace_id in the initial log event." 
        };
    }

    // Step 2: Use the trace_id to find the log with identifiers
    const traceQueryPayload: DatadogPayload = {
        ...initialPayload,
        filter: {
            ...initialPayload.filter,
            query: `trace_id:${traceId}`,
        },
        page: {
            limit: 20 // Increase limit to better find the identifiers log
        }
    };

    const finalResult = await executeDatadogQuery(traceQueryPayload);

    return { 
        initialResponse: initialResult.data,
        finalResponse: finalResult.data,
        traceId,
        error: finalResult.error,
        details: finalResult.details
    };
}
