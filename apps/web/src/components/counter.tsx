'use client'

import { useState } from 'react'

import { Button } from '@pikzee/ui'

const Counter = () => {
  const [count, setCount] = useState(0)
  return (
    <div className="flex flex-col items-center gap-4 ">
      <h1>Counter: {count}</h1>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setCount(count + 1)}>
          Increment
        </Button>
        <Button variant="secondary" onClick={() => setCount(count - 1)}>
          Decrement
        </Button>
      </div>
    </div>
  )
}

export default Counter
