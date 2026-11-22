import React from 'react'

export default function GameArtwork({ src, title, genre, platform }) {
  return (
    <div className="game-card-media">
      {src ? (
        <>
          <img className="game-card-media-backdrop" src={src} alt="" aria-hidden="true" />
          <img className="game-card-media-art" src={src} alt={title} />
        </>
      ) : (
        <div className="game-card-media-fallback" aria-label={`${title} artwork unavailable`}>
          <span className="game-card-media-brand">NES / FAMICOM GAME</span>
          <strong>{title}</strong>
          <span className="game-card-media-platform">{platform}</span>
        </div>
      )}
      {genre && <span className="game-card-media-genre">{genre}</span>}
    </div>
  )
}
