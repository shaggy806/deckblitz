/**
 * Room codes. A code is a join credential — anyone holding one can walk into
 * that game — so it carries nothing but randomness: no shard prefix, nothing
 * about the server's layout. Main-side: no engine.
 */

/** No 0/O/1/I — avoids characters easily confused when a code is read aloud. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 5;

export function randomRoomId(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/** A fresh code no room holds: drawn until `inUse` says it's free. */
export function allocateRoomCode(inUse: (code: string) => boolean): string {
  let id = randomRoomId();
  while (inUse(id)) id = randomRoomId();
  return id;
}
