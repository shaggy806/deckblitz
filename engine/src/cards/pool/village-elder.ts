import { defineCard } from "../define.js";

export default defineCard({
  name: "Village Elder",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
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
