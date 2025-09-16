import { get } from 'http'
import { ModusConfig } from './config'
import { log } from 'console'

export type ScreenPage = {
  title: string,
  description: string,
  mode: 'image-only' | 'text-and-image',
  showBottomText: boolean,
  duration: number,
  fileType: 'image' | 'video',
  fileMode: 'cover' | 'contain',
  fileUrl: string
}

export type ScreenInfo = {
  title: string,
  bottomText: string,
  pages: ScreenPage[]
}

type ModusOperandiLoginData = {
  token: string,
}

function getUrl(path: string): string {
  return `${ModusConfig.host}${path}`
}

async function login(): Promise<ModusOperandiLoginData> {

  const data = new FormData()
  data.append('username', ModusConfig.username)
  data.append('password', ModusConfig.password)

  const response = await fetch(getUrl("/api/auth-service/auth"), {
    method: 'POST',
    body: data
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${response.statusText}`)
  }

  return response.json()

}

async function getRecord(loginData: ModusOperandiLoginData, id: string): Promise<any> {
  const url = getUrl(`/api/dataaccess-service/records/record/${id}?group=${ModusConfig.groupId}&lang=${ModusConfig.lang}`)

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: loginData.token }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch record: ${response.status} ${response.statusText}`)
  }

  return (await response.json()).data
}

function getFieldValue<T = any>(record: any, fieldId: string): T {
  const field = record.fields.find((f: any) => f.id === fieldId)

  if (!field) {
    throw new Error(`Field ${fieldId} not found in record ${record.id}`)
  }

  return field.values[0] as T
}

function mapFieldValue<T>(record: any, fieldId: string, mappings: Record<string, T>): T | null {
  const value = getFieldValue<{ value: string[] }>(record, fieldId).value[0]
  return mappings[value] || null
}


function getFieldValues<T = any>(record: any, fieldId: string): T {
  const field = record.fields.find((f: any) => f.id === fieldId)

  if (!field) {
    throw new Error(`Field ${fieldId} not found in record ${record.id}`)
  }

  return field.values as T
}



export async function getScreenInfo(screenId: string): Promise<ScreenInfo> {
  const loginData = await login()

  const screenData = await getRecord(loginData, screenId)
  const pagesData: any[] = []

  for(let p  of getFieldValues<{ id: string }[]>(screenData, ModusConfig.screenFieldIds.pages))
    pagesData.push(await getRecord(loginData, p.id))

  return {
    title: getFieldValue<{ it: string }>(screenData, 'object-title')?.it,
    bottomText: getFieldValue<{ it: string }>(screenData, ModusConfig.screenFieldIds.bottomText)?.it || '',
    pages: pagesData.map(p => {

      const mode = mapFieldValue<ScreenPage['mode']>(p, ModusConfig.pageFieldIds.mode, {
        '0': 'text-and-image',
        '1': 'image-only'
      }) || 'text-and-image'

      const fileMode = mapFieldValue<ScreenPage['fileMode']>(p, ModusConfig.pageFieldIds.fileCropMode, {
        '0': 'cover',
        '1': 'contain'
      }) || 'cover'

      const showBottomText = mapFieldValue<boolean>(p, ModusConfig.pageFieldIds.showBottomText, {
        '0': true,
        '1': false
      }) || false

      const file = getFieldValue<{ name: string, thumbnail: string, view: string }>(p, 'object-files')

      const fileType: ScreenPage['fileType'] = file.name.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i) ? 'video' : 'image'

      return {
        title: getFieldValue<{ it: string }>(p, 'object-title')?.it || '',
        description: getFieldValue<{ it: string }>(p, 'object-description')?.it || '',
        duration: parseFloat(getFieldValue<{ value: string }>(p, ModusConfig.pageFieldIds.duration)?.value || '10'),
        mode,
        fileMode,
        showBottomText,
        fileType,
        fileUrl: getUrl(fileType === 'image' ? file.thumbnail : file.view)
      }
    })
  }

}