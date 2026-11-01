import { defineCard } from "../define.js";

// "During your next turn": that turn alone, so not the turn it's cast on even if
// that's yours (the ruling). Each storm copy exiles a card of its own.
const TEXT = "Exile the top card of your library. During your next turn, you may play that card.";

export default defineCard({
  name: "Galvanic Relay",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${TEXT}\nStorm (When you cast this spell, copy it for each spell cast before it this turn.)`,
  targets: [],
  effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn-only" },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm — when you cast this spell, copy it for each spell cast before it this turn.",
    },
  ],
});
