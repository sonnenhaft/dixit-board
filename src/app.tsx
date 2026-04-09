import type { FunctionComponent } from 'preact'
import { useState } from 'preact/hooks'

export const App: FunctionComponent = () => {
  const [count, setCount] = useState(0)

  return (
    <div class="app">
      <h1>Preact + TypeScript + Vite</h1>
      <p>
        Редактируй <code>src/app.tsx</code> — HMR обновит страницу мгновенно.
      </p>
      <button onClick={() => setCount(c => c + 1)}>
        Счётчик: {count}
      </button>
    </div>
  )
}

