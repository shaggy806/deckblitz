import { defineCard } from "../define.js";

export default defineCard({
  name: "Vampire Warlord",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 4,
  toughness: 2,
  text: "Sacrifice another creature: Regenerate this creature. (The next time this creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Sacrifice another creature: Regenerate this creature.",
      otherOnly: true,
    },
  ],
});
