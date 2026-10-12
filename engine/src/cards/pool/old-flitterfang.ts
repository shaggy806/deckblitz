import { defineCard } from "../define.js";

export default defineCard({
  name: "Old Flitterfang",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rat", "Faerie"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of each end step, if a creature died this turn, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\n{2}{B}, Sacrifice another creature or artifact: Old Flitterfang gets +2/+2 until end of turn.",
  activated: [
    {
      cost: {
        mana: "{2}{B}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["creature", "artifact"] } },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{B}, Sacrifice another creature or artifact: Old Flitterfang gets +2/+2 until end of turn.",
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "At the beginning of each end step, if a creature died this turn, create a Food token.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
