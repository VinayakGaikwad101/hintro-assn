import cron from "node-cron";
import { sql } from "../db/index.js";

export const checkAndSendReminders = async () => {
  const traceId = "cron-" + Date.now();
  console.log(`[${traceId}] Starting scheduled overdue action item check...`);

  try {
    const now = new Date();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn(
        `[${traceId}] Warning: DISCORD_WEBHOOK_URL missing in .env. Skipping notifications.`,
      );
      return;
    }

    // 1. Identify overdue action items that haven't been reminded in the last 24 hours
    const overdueItems = await sql`
      SELECT ai.* FROM action_items ai
      WHERE ai.status != 'COMPLETED'
      AND ai.due_date < ${now}
      AND NOT EXISTS (
        SELECT 1 FROM reminder_history rh
        WHERE rh.action_item_id = ai.id
        AND rh.sent_at > ${new Date(now.getTime() - 24 * 60 * 60 * 1000)}
      )
    `;

    if (overdueItems.length === 0) {
      console.log(`[${traceId}] No new overdue items requiring notification.`);
      return;
    }

    console.log(
      `[${traceId}] Found ${overdueItems.length} overdue items to process.`,
    );

    for (const item of overdueItems) {
      try {
        // 2. Trigger reminder notification formatted for Discord
        const messageBody = {
          content: `⚠️ **🚨 Overdue Action Item Reminder** 🚨\n\n**Task:** ${item.task}\n**Assigned To:** ${item.assignee}\n**Due Date:** ${new Date(item.due_date).toLocaleDateString()}\n**Current Status:** \`${item.status}\``,
        };

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageBody),
        });

        if (!response.ok) {
          throw new Error(
            `Discord Webhook failed with status ${response.status}`,
          );
        }

        // 3. Record reminder history on success
        await sql`
          INSERT INTO reminder_history (action_item_id, status)
          VALUES (${item.id}::uuid, 'SUCCESS')
        `;

        console.log(
          `[${traceId}] Successfully sent Discord reminder for item: ${item.id}`,
        );
      } catch (itemError) {
        console.error(
          `[${traceId}] Failed to send reminder for item ${item.id}:`,
          itemError,
        );

        await sql`
          INSERT INTO reminder_history (action_item_id, status)
          VALUES (${item.id}::uuid, 'FAILED')
        `;
      }
    }
  } catch (error) {
    console.error(
      `[${traceId}] Critical error running reminder scheduler:`,
      error,
    );
  }
};

// Start the scheduler loop
export const initScheduler = () => {
  // Runs every single minute for easy assignment testing
  cron.schedule("* * * * *", async () => {
    await checkAndSendReminders();
  });

  console.log("⏰ Scheduled reminder job initialized to monitor every minute.");
};
