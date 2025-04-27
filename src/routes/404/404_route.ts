import express, { type Request, type Response, type Router } from 'express'

const router: Router = express.Router()
export default router
/* eslint-disable @typescript-eslint/no-misused-promises */
router.all('*', async (req: Request, res: Response): Promise<void> => {
  res.status(404).render('pages/404', {
    layout: 'hero',
    title: '404'
  })
})
