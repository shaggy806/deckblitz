import { defineCard } from "../define.js";

export default defineCard({
  name: "Ignite Disorder",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Ignite Disorder deals 3 damage divided as you choose among one, two, or three target white and/or blue creatures.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["W"] }, { colors: ["U"] }] } },
      min: 1,
      max: 3,
    },
  ],
  divided: { total: 3, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
