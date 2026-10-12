import { defineCard } from "../define.js";

export default defineCard({
  name: "Tel-Jilad Lifebreather",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Shaman"],
  power: 3,
  toughness: 2,
  text: "{G}, {T}, Sacrifice a Forest: Regenerate target creature.",
  activated: [
    {
      cost: { mana: "{G}", tap: true, sacrifice: { filter: { subtype: "Forest" } } },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{G}, {T}, Sacrifice a Forest: Regenerate target creature.",
    },
  ],
});
