import { defineCard } from "../define.js";

const MORBID_TEXT =
  "Morbid — {T}, Tap two untapped creatures you control: Create a 5/5 black Demon creature token with flying. Activate only if a creature died this turn.";

// The two other creatures needn't have been under your control since your
// turn began (the ruling): `tapOthers` doesn't ask it.
export default defineCard({
  name: "Skirsdag High Priest",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: MORBID_TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" } },
      },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: { kind: "create-token", token: "5/5 Demon Token", count: 1 },
      resolve: null,
      text: MORBID_TEXT,
    },
  ],
});
