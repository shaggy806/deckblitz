import { defineCard } from "../define.js";

export default defineCard({
  name: "Metallurgeon",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 2,
  text: "{W}, {T}: Regenerate target artifact.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["artifact"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{W}, {T}: Regenerate target artifact.",
    },
  ],
});
