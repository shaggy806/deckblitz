import { defineCard } from "../define.js";

export default defineCard({
  name: "Nezumi Shadow-Watcher",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: Destroy target Ninja.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", whose: "any", filter: { subtype: "Ninja" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "Sacrifice this creature: Destroy target Ninja.",
    },
  ],
});
