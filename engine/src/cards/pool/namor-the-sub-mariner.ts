import { defineCard } from "../define.js";

const POWER_TEXT = "Namor's power is equal to the number of Merfolk you control.";
const CAST_TEXT =
  "Whenever you cast a noncreature spell with one or more blue mana symbols in its mana cost, create that many 1/1 blue Merfolk creature tokens.";
const BLUE_SYMBOLS = { manaSymbolsOf: "trigger-object", color: "U" } as const;

export default defineCard({
  name: "Namor the Sub-Mariner",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Merfolk", "Villain"],
  power: 0,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${POWER_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Merfolk", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      // "With one or more blue mana symbols": the same count, at least one.
      condition: { kind: "amounts", left: BLUE_SYMBOLS, op: "gte", right: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Merfolk Token", count: BLUE_SYMBOLS },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
