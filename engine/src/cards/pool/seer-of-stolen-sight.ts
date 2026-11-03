import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever one or more artifacts and/or creatures you control are put into a graveyard from the battlefield, surveil 1. (Look at the top card of your library. You may put that card into your graveyard.)";

export default defineCard({
  name: "Seer of Stolen Sight",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Warlock"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { typesAnyOf: ["artifact", "creature"] }, batched: true },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
