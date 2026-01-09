import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { messages, projectContext } = await req.json();

        const today = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // Build comprehensive system prompt with ALL app data
        let systemPrompt = `You are FloorOps AI, the intelligent assistant for FloorOps Pro - an enterprise commercial flooring project management application.

═══════════════════════════════════════════════════════════════
CURRENT USER: Derek Morrison (Project Manager / Owner)
TODAY'S DATE: ${today}
═══════════════════════════════════════════════════════════════

You have COMPLETE ACCESS to all company data. Use this information to answer ANY question about projects, finances, schedules, team, vendors, punch lists, invoices, estimates, and more.

`;

        if (projectContext) {
            // Projects Section
            if (projectContext.projects) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
ACTIVE PROJECTS
═══════════════════════════════════════════════════════════════
${projectContext.projects}

`;
            }

            // Punch Items Section
            if (projectContext.punchItems) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
OPEN PUNCH LIST ITEMS (Requires Attention)
═══════════════════════════════════════════════════════════════
${projectContext.punchItems}

`;
            }

            // Daily Logs Section
            if (projectContext.dailyLogs) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
RECENT DAILY LOGS & FIELD REPORTS
═══════════════════════════════════════════════════════════════
${projectContext.dailyLogs}

`;
            }

            // Estimates Section
            if (projectContext.estimates) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
ESTIMATES & PROPOSALS
═══════════════════════════════════════════════════════════════
${projectContext.estimates}

`;
            }

            // Vendors Section
            if (projectContext.vendors) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
VENDORS & SUPPLIERS
═══════════════════════════════════════════════════════════════
${projectContext.vendors}

`;
            }

            // Inventory Section
            if (projectContext.inventory) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
WAREHOUSE INVENTORY
═══════════════════════════════════════════════════════════════
${projectContext.inventory}

`;
            }

            // Team Section
            if (projectContext.team) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
TEAM MEMBERS
═══════════════════════════════════════════════════════════════
${projectContext.team}

`;
            }

            // Subcontractors Section
            if (projectContext.subcontractors) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
SUBCONTRACTORS
═══════════════════════════════════════════════════════════════
${projectContext.subcontractors}

`;
            }

            // Invoices Section
            if (projectContext.invoices) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
CLIENT INVOICES & PAYMENTS
═══════════════════════════════════════════════════════════════
${projectContext.invoices}

`;
            }

            // Messages Section (recent)
            if (projectContext.messages) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
RECENT MESSAGES & COMMUNICATIONS
═══════════════════════════════════════════════════════════════
${projectContext.messages}

`;
            }

            // Schedule Section
            if (projectContext.schedule) {
                systemPrompt += `
═══════════════════════════════════════════════════════════════
SCHEDULE & UPCOMING TASKS
═══════════════════════════════════════════════════════════════
${projectContext.schedule}

`;
            }
        }

        systemPrompt += `
═══════════════════════════════════════════════════════════════
YOUR INSTRUCTIONS
═══════════════════════════════════════════════════════════════
1. Answer questions using the ACTUAL DATA above - never make up information
2. When comparing dates, use today's date (${today}) to determine what's overdue
3. Be specific - use project names, client names, dollar amounts, and dates
4. For status questions, check the status field and due dates
5. Be proactive - if you notice issues (overdue items, unpaid invoices), mention them
6. Use bullet points and markdown for clarity
7. If data is missing, say "I don't have that information in the current dataset"
8. For financial questions, calculate totals and show your work
9. Be concise but thorough - Derek is busy running a flooring business
`;

        // Model priority: env variable > gpt-5-nano > gpt-4o-mini (fallback)
        const primaryModel = process.env.OPENAI_MODEL || 'gpt-5-nano';
        const fallbackModel = 'gpt-4o-mini';

        let response;
        let usedModel = primaryModel;

        try {
            response = await openai.chat.completions.create({
                model: primaryModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 1500,
            });
        } catch (primaryError: any) {
            // If primary model fails (e.g., no access), try fallback
            console.warn(`Primary model ${primaryModel} failed, trying fallback ${fallbackModel}:`, primaryError.message);
            usedModel = fallbackModel;
            response = await openai.chat.completions.create({
                model: fallbackModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 1500,
            });
        }

        console.log(`AI response generated using model: ${usedModel}`);

        return NextResponse.json({
            role: 'assistant',
            content: response.choices[0].message.content,
        });
    } catch (error: any) {
        console.error('OpenAI API Error:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            code: error.code,
            type: error.type
        });
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

