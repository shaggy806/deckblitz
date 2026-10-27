import { defineCard } from "../define.js";

// EDHREC rank 19234. Each opponent is asked in turn
// whether to pay {1} (Polygraph Orb's punisher shape); each who didn't then
// sacrifices a permanent of their own choice.

const TEXT = "When this creature enters, each opponent sacrifices a permanent of their choice unless they pay {1}.";

export default defineCard({
  name: "Rishadan Cutpurse",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      resolve: null,
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [{ pay: "{1}", text: "Pay {1}" }],
        ifDidnt: { kind: "sacrifice", who: "that-player", filter: {}, count: 1 },
      },
      text: TEXT,
    },
  ],
});
