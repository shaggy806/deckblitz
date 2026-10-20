import { defineCard } from "../define.js";

export default defineCard({
  name: "Frost Bite",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: ["snow"],
  types: ["instant"],
  text: "Frost Bite deals 2 damage to target creature or planeswalker. If you control three or more snow permanents, it deals 3 damage instead.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  // The snow count is read as it resolves (the ruling).
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      ifCondition: { kind: "controls", filter: { supertype: "snow" }, atLeast: 3 },
      then: 3,
      else: 2,
    },
  },
});
