import cron from 'node-cron'
import { sendPushToAll } from '../services/pushService.js'
import { checkWaterAlert, checkProteinAlert, flagMissingSupplements, checkFastingCompletion } from '../services/fastingService.js'
import { REMINDERS, SUPPLEMENT_REMINDERS } from '../config/constants.js'

const TIMEZONE = process.env.TZ || 'America/Sao_Paulo'

export function startReminderJobs() {
  // Protocol reminders
  for (const reminder of REMINDERS) {
    cron.schedule(reminder.cron, async () => {
      console.log(`[cron] Sending reminder: ${reminder.body}`)
      await sendPushToAll(reminder.title, reminder.body)
    }, { timezone: TIMEZONE })
  }

  // Supplement reminders
  for (const reminder of SUPPLEMENT_REMINDERS) {
    cron.schedule(reminder.cron, async () => {
      console.log(`[cron] Sending supplement reminder: ${reminder.body}`)
      await sendPushToAll(reminder.title, reminder.body)
    }, { timezone: TIMEZONE })
  }

  // Water alert at 18:00 if below 2L
  cron.schedule('0 18 * * *', async () => {
    console.log('[cron] Checking water intake...')
    await checkWaterAlert()
  }, { timezone: TIMEZONE })

  // Protein alert at 19:00 if below 80g
  cron.schedule('0 19 * * *', async () => {
    console.log('[cron] Checking protein intake...')
    await checkProteinAlert()
  }, { timezone: TIMEZONE })

  // Mark fast as complete at 14:00 if no food since 20:00
  cron.schedule('1 14 * * *', async () => {
    console.log('[cron] Checking fasting completion...')
    await checkFastingCompletion()
  }, { timezone: TIMEZONE })

  // Flag missing creatine at 20:00
  cron.schedule('0 20 * * *', async () => {
    console.log('[cron] Flagging missing supplements...')
    await flagMissingSupplements()
  }, { timezone: TIMEZONE })

  console.log('[cron] All reminder jobs started')
}
