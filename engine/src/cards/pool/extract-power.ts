import { defineCard } from "../define.js";

// EDHREC rank 15533.
//
// Edward Kenway's face-down impulse exile, from every player's library at
// once (Rocco's `whose: "each-player"`); the permission is the caster's,
// whoever owns the cards, and "without paying their mana costs" is the only
// way to cast them (Golos's `free: { only: true }`). Lands may be played.

const TEXT =
  "Look at the top card of each player's library, then exile those cards face down. You may play them without paying their mana costs for as long as they remain exiled.";

export default defineCard({
  name: "Extract Power",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "impulse-exile",
    amount: 1,
    whose: "each-player",
    duration: "while-exiled",
    faceDown: true,
    free: { only: true },
  },
});
