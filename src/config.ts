import { group } from 'console'
import dotenv from 'dotenv'

dotenv.config()

export const ModusConfig  = {
  username: process.env.MO_USER || '',
  password: process.env.MO_PASSWORD || '',
  host: process.env.MO_HOST || '',
  groupId: process.env.MO_GROUP_ID || '685bad9b01b50403337976a6',
  lang: process.env.MO_LANG || 'it',
  screenIds: (process.env.MO_SCREEN_IDS || '').split(',').map(s => s.trim()).filter(s => s.length > 0),
  screenFieldIds: {
    pages: process.env.MO_SCREEN_PAGES_FIELD_ID || '',
    bottomText: process.env.MO_SCREEN_BOTTOM_TEXT_FIELD_ID || ''
  },
  pageFieldIds: {
    mode: process.env.MO_PAGE_MODE_FIELD_ID || '',
    fileCropMode: process.env.MO_PAGE_CROP_MODE_FIELD_ID || '',
    duration: process.env.MO_PAGE_DURATION_FIELD_ID || '',
    showBottomText: process.env.MO_PAGE_SHOW_BOTTOM_TEXT_FIELD_ID || ''
  }
}