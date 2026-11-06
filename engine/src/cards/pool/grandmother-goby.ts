import { defineCard } from "../define.js";

// Mystery Booster Commander. The tokens count the mana spent on the spell,
// countered or not.
const TEXT =
  "Whenever you cast a noncreature spell, counter that spell. Create a number of 1/1 blue Merfolk creature tokens equal to the amount of mana spent to cast that spell.";

export default defineCard({
  name: "Grandmother Goby",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "counter", target: "trigger-object" },
          { kind: "create-token", token: "Merfolk Token", count: { manaSpentOf: "trigger-object" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
