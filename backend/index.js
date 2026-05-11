import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { supabase } from './src/config/supabase.js'
import mealsRouter from './src/routes/meals.js'
import pushRouter from './src/routes/push.js'
import dashboardRouter from './src/routes/dashboard.js'
import progressRouter from './src/routes/progress.js'
import checklistRouter from './src/routes/checklist.js'
import { startReminderJobs } from './src/jobs/reminders.js'
import { startWeeklyReportJob } from './src/jobs/weeklyReport.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Auth middleware — validates Supabase JWT
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  req.user = user
  next()
}

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

app.use('/meals', requireAuth, mealsRouter)
app.use('/push', requireAuth, pushRouter)
app.use('/dashboard', requireAuth, dashboardRouter)
app.use('/progress', requireAuth, progressRouter)
app.use('/checklist', requireAuth, checklistRouter)

// Start cron jobs
startReminderJobs()
startWeeklyReportJob()

app.listen(PORT, () => {
  console.log(`[server] Body Tech backend running on port ${PORT}`)
})
