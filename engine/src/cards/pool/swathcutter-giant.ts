import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks, it deals 1 damage to each creature defending player controls.";

export default defineCard({
  name: "Swathcutter Giant",
  manaCost: "{4}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature" }, amount: 1, whose: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
