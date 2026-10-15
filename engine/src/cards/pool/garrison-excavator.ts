import { defineCard } from "../define.js";

// EDHREC rank 15912. "One or more cards leave your graveyard" is one trigger
// per batch (the ruling) — Quintorius, History Chaser's trigger.
const LEAVE_TEXT =
  "Whenever one or more cards leave your graveyard, create a 2/2 red and white Spirit creature token.";

export default defineCard({
  name: "Garrison Excavator",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Sorcerer"],
  power: 3,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Red-White 2/2)", count: 1 },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
