import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatRelativeTime = (isoString) => {
  return dayjs(isoString).fromNow()
}

export const formatDate = (isoString) => {
  return dayjs(isoString).format('DD MMM YYYY')
}
