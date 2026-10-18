import { defineCard } from "../define.js";

// EDHREC rank 11386.

const CAST_TEXT = "Whenever you cast a noncreature spell, put an oil counter on this creature.";
const SAC_TEXT =
  "{6}{R}, Sacrifice this creature: Discard your hand, then draw four cards. This ability costs {1} less to activate for each oil counter on this creature.";

export default defineCard({
  name: "Vindictive Flamestoker",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wizard"],
  power: 1,
  toughness: 2,
  text: `${CAST_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "oil", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}{R}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: 4 },
        ],
      },
      costReduction: { reduceGeneric: { countersOnSource: "oil" } },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
