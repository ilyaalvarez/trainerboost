import { useState } from 'react'

export function useDraftList<T extends { id: string }>(blank: () => T, initial?: T[]) {
  const [items, setItems] = useState<T[]>(() => initial ?? [blank()])

  const add = () => setItems(prev => [...prev, blank()])

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const updateField = (id: string, field: keyof T, value: T[keyof T]) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const move = (index: number, dir: -1 | 1) =>
    setItems(prev => {
      const arr = [...prev]
      const target = index + dir
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]]
      return arr
    })

  const reset = (newItems?: T[]) => setItems(newItems ?? [blank()])

  return { items, setItems, add, remove, updateField, move, reset }
}
