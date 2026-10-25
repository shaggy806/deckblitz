import { defineCard } from "../define.js";

// EDHREC rank 20614.
//
// The target is chosen as the trigger goes on the stack; whether to goad it
// is asked as it resolves.

const TEXT =
  "Whenever this creature attacks, you may goad target creature defending player controls. (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)";

export default defineCard({
  name: "Goblin Racketeer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "may", prompt: "Goad that creature?", effect: { kind: "goad", target: 0 } },
      resolve: null,
      text: "Whenever this creature attacks, you may goad target creature defending player controls.",
    },
  ],
});
