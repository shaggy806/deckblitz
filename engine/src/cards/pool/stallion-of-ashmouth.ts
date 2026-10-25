import { defineCard } from "../define.js";

const TEXT =
  "Delirium — {1}{B}: This creature gets +1/+1 until end of turn. Activate only if there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Stallion of Ashmouth",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horse"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
