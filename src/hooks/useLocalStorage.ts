import { useEffect, useState } from 'react'

const pathSession = window.location.href.split('/')[3]
const testCase = window.location.href.split('/')[4]
const PREFIX = 'apex-code-challenge-' + pathSession +"-"+ testCase

export default function useLocalStorage(key: string, initialValue: any) {
  const prefixedKey = PREFIX + key
  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(prefixedKey)
    if (jsonValue != null) return JSON.parse(jsonValue)

    if (typeof initialValue === 'function') {
      return initialValue()
    } else {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(prefixedKey, JSON.stringify(value))
  }, [prefixedKey, value])

  return [value, setValue]
}