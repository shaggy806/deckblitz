import { defineCard } from "../define.js";

// Dominaria United Commander (DMC). EDHREC rank 8282.
const TEXT =
  "Whenever a creature you control becomes blocked, it gets +3/+3 until end of turn for each creature blocking it.";

export default defineCard({
  name: "General Marhault Elsdragon",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Elf", "Warrior"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: { product: [3, { blockersOf: "trigger-object" }] },
        toughness: { product: [3, { blockersOf: "trigger-object" }] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
