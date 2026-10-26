import { defineCard } from "../define.js";

// EDHREC rank 21804.
//
// "This creature or another creature dies" is any creature dying, this one
// included (a leaves-the-battlefield trigger looks back — rule 603.10a), as
// Blood Artist's is.
const TEXT = "Whenever this creature or another creature dies, target player mills a card.";

export default defineCard({
  name: "Selhoff Occultist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
