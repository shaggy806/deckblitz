import { defineCard } from "../define.js";

// "Add {U} or {C}{U}" is one ability with two outputs, written as two: nothing
// tells them apart but what they make.

const TEXT = "{T}: Add {U} or {C}{U}. Spend this mana only to pay cumulative upkeep costs.";
const SPEND = { purposes: ["cumulative-upkeep"], text: "Spend this mana only to pay cumulative upkeep costs." } as const;

export default defineCard({
  name: "Adarkar Unicorn",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1, spendOnly: SPEND },
      resolve: null,
      text: TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["C", "U"] }, amount: 1, spendOnly: SPEND },
      resolve: null,
      text: TEXT,
    },
  ],
});
