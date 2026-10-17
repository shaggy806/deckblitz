import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] If the last target of Burn Together is an illegal target as the spell resolves
//     but the first target is still legal, Burn Together will still resolve and you'll still
//     sacrifice the first target.
//   [2023-09-01] If the first target of Burn Together is an illegal target as the spell resolves
//     but the last target is still legal, Burn Together will resolve, but no damage will be dealt
//     and nothing will be sacrificed.

export default defineCard({
  name: "Burn Together",
  art: "https://cards.scryfall.io/art_crop/back/7/7/770ee3da-d33e-466f-9a2e-ad2d08ef5012.jpg",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Target creature you control deals damage equal to its power to any other target. Then sacrifice it.",
  targets: ["creature-you-control", { kind: "other", of: "any-target", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: { powerOf: 0 }, target: 1, from: { target: 0 } },
      { kind: "sacrifice-target", target: 0 },
    ],
  },
  faces: ["Callous Sell-Sword", "Burn Together"],
  adventure: true,
});
