import { defineCard } from "../define.js";

export default defineCard({
  name: "Dauthi Jackal",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dauthi", "Jackal"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\n{B}{B}, Sacrifice this creature: Destroy target blocking creature.",
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{B}{B}, Sacrifice this creature: Destroy target blocking creature.",
    },
  ],
});
