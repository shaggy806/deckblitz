import { defineCard } from "../define.js";

export default defineCard({
  name: "Ancient Silverback",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 6,
  toughness: 5,
  text: "{G}: Regenerate this creature. (The next time this creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}: Regenerate this creature.",
    },
  ],
});
