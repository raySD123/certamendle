import { useEffect, useState } from 'react'
import historyAutocompleteOptions from './historyAutocomplete.json'
import historyQuestions from './historyQuestions.json'
import './App.css'

const tiles = Array.from({ length: 5 }, (_, index) => index)
const winMessages = {
  1: 'Oh my days, go touch some grass.',
  2: "Dang, someone's been studying, huh?",
  3: 'A solid guess for a solid player.',
  4: 'Not bad. Not good.',
  5: "Even I could've gotten that. But hey, you got it, didn't you? And that's what matters.",
}

function App() {
  const [question] = useState(
    () => {
      const today = new Date().toISOString().slice(0, 10)
      return historyQuestions.find(({ levelDate }) => levelDate === today)
    },
  )
  const [text, setText] = useState('')
  const [visibleClues, setVisibleClues] = useState(1)
  const [cluesAtWin, setCluesAtWin] = useState(null)
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [hasWrongGuess, setHasWrongGuess] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [resultDismissed, setResultDismissed] = useState(false)
  const [suggestionSelected, setSuggestionSelected] = useState(false)
  const [activePopup, setActivePopup] = useState(null)
  const [shareVisible, setShareVisible] = useState(false)
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    if (!hasWrongGuess) return undefined

    const timeoutId = window.setTimeout(() => setHasWrongGuess(false), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [hasWrongGuess, wrongGuesses])

  useEffect(() => {
    if (!activePopup) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape' && activePopup !== 'about') {
        setActivePopup(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePopup])

  const suggestions = !gameResult && !suggestionSelected && text.trim()
    ? historyAutocompleteOptions
        .filter((option) =>
        option.toLowerCase().includes(text.trim().toLowerCase()),
        )
        .sort((first, second) => first.localeCompare(second))
    : []
  const shareText = question && cluesAtWin !== null
    ? `I solved Certamendle (${question.levelDate}) in ${cluesAtWin}/${tiles.length} clues!\n${'🟪'.repeat(cluesAtWin)}${'⬜'.repeat(tiles.length - cluesAtWin)}\n${window.location.href}`
    : ''

  async function handleShare() {
    setShareVisible(true)

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard access is unavailable.')
      }

      await navigator.clipboard.writeText(shareText)
      setShareStatus('Result copied to clipboard!')
    } catch {
      setShareStatus('Could not copy automatically. Select and copy the text below.')
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const guess = text.trim()
    if (!guess || gameResult || !question) return

    if (guess.toLowerCase() === question.answer.trim().toLowerCase()) {
      setCluesAtWin(visibleClues)
      setVisibleClues(tiles.length)
      setGameResult('win')
    } else {
      const nextWrongGuesses = wrongGuesses + 1
      setWrongGuesses(nextWrongGuesses)
      setHasWrongGuess(true)
      setVisibleClues(Math.min(nextWrongGuesses + 1, tiles.length))
      if (nextWrongGuesses === tiles.length) setGameResult('loss')
    }
    setText('')
    setSuggestionSelected(false)
  }

  return (
    <div className="app-screen">
      <header className="app-header">
        <div className="app-header-content">
          <button
            className="header-popup-button"
            type="button"
            aria-label="Open placeholder popup"
            onClick={() => setActivePopup('placeholder')}
          >
            ⋯
          </button>
          <h1>Certamendle</h1>
          <button
            className="header-popup-button"
            type="button"
            aria-label="About Certamendle"
            onClick={() => setActivePopup('about')}
          >
            <span aria-hidden="true">?</span>
          </button>
        </div>
      </header>
      <main className="app-content">
        {question ? (
          <>
            <div className="color-tiles">
              {tiles.map((tile) => (
                <div className="tile-item" key={tile}>
                  <div
                    className={`color-tile${tile < visibleClues ? ' revealed' : ''}${gameResult === 'win' && tile + 1 === cluesAtWin ? ' winning-clue' : ''}`}
                  >
                    {tile < visibleClues && (
                      <span className="placeholder-text">
                        {question[`clue${tile + 1}`]}
                        {gameResult === 'win' && tile + 1 === cluesAtWin && (
                          <span className="winning-clue-message">
                            You correctly got the answer here.
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {gameResult && (
              <p className="correct-answer-message">
                The correct answer was {question.answer}.
              </p>
            )}
            <form className="text-entry" onSubmit={handleSubmit}>
              <div className="text-field">
                <ul
                  className="autocomplete-options"
                  id="autocomplete-options"
                  role="listbox"
                  hidden={suggestions.length === 0}
                >
                  {suggestions.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        className="autocomplete-option"
                        type="button"
                        role="option"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setText(suggestion)
                          setSuggestionSelected(true)
                        }}
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
                <input
                  className={`text-box${hasWrongGuess ? ` wrong-answer shake-${wrongGuesses % 2}` : ''}`}
                  type="text"
                  aria-label="Enter text"
                  placeholder="Enter guess here..."
                  aria-invalid={hasWrongGuess}
                  role="combobox"
                  aria-controls="autocomplete-options"
                  aria-autocomplete="list"
                  aria-expanded={suggestions.length > 0}
                  autoFocus
                  disabled={Boolean(gameResult)}
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value)
                    setHasWrongGuess(false)
                    setSuggestionSelected(false)
                  }}
                />
              </div>
              <button className="submit-button" type="submit" disabled={Boolean(gameResult)}>
                Submit
              </button>
            </form>
          </>
        ) : (
          <p className="correct-answer-message">No question is available for today yet.</p>
        )}
      </main>
      {gameResult && !resultDismissed && (
        <div
          className="result-backdrop"
          onClick={() => setResultDismissed(true)}
        >
          <section
            className="result-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-title"
          >
            <h2 id="result-title">
              {gameResult === 'win' ? 'You Win! 🎉🏆' : 'You Lost! 😢'}
            </h2>
            <p>
              {gameResult === 'win' ? (
                <>
                  The answer was, indeed, <strong>{question.answer}</strong>.
                  <br />
                  You got it with {cluesAtWin}{' '}
                  {cluesAtWin === 1 ? 'clue' : 'clues'} revealed.
                  <br />
                  <em>{winMessages[cluesAtWin]}</em>
                </>
              ) : (
                <>
                  The answer was <strong>{question.answer}</strong>. Better luck
                  next time!
                </>
              )}
            </p>
            {gameResult === 'win' && (
              <>
                <button
                  className="share-button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleShare()
                  }}
                >
                  Share
                </button>
                {shareVisible && (
                  <>
                    <textarea
                      className="share-text"
                      aria-label="Copyable share text"
                      readOnly
                      rows="3"
                      value={shareText}
                      onClick={(event) => {
                        event.stopPropagation()
                        event.currentTarget.select()
                      }}
                      onFocus={(event) => event.currentTarget.select()}
                    />
                    <p className="share-status" aria-live="polite">{shareStatus}</p>
                  </>
                )}
              </>
            )}
            <p className="dismiss-hint">Click anywhere to dismiss</p>
          </section>
        </div>
      )}
      {activePopup && (
        <div
          className={`result-backdrop info-backdrop${activePopup === 'about' ? ' about-backdrop' : ''}`}
          onClick={activePopup === 'about' ? undefined : () => setActivePopup(null)}
        >
          <section
            className={`info-dialog${activePopup === 'about' ? ' about-dialog' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="info-dialog-close"
              type="button"
              aria-label="Close popup"
              onClick={() => setActivePopup(null)}
            >
              ×
            </button>
            {activePopup === 'about' ? (
              <>
                <h2 id="info-title">About Certamendle</h2>
                <p className="about-summary">
                  Wordle, but for nerds. <br />
                  67 <br />
                  If you're interested in working on this, whether it be coding or writing, feel free to send me an email! Currently the aim is to expand beyond just Roman History, and implement Mythology and Literature categories as well.<br />
                  <u>raymondpansd@gmail.com</u>
                </p>
                <section className="changelog-section" aria-labelledby="changelog-title">
                  <h3 id="changelog-title">Changelog</h3>
                  <div className="changelog-list" tabIndex="0">
                    <p>Oct. 28, 2026: created the site :D !!!!! only history now, but the site works haha</p>
                  </div>
                </section>
              </>
            ) : (
              <>
                <h2 id="info-title">Placeholder</h2>
                <p>This popup is a placeholder.</p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default App
