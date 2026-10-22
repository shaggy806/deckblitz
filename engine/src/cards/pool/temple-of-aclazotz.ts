import { defineCard } from "../define.js";

// The back face of Arguel's Blood Fast.
//
// Rulings:
//   [2017-09-29] For the last ability of Temple of Aclazotz, use the creature's toughness as it
//     last existed on the battlefield to determine how much life you gain.
//   [2017-09-29] Once you've announced the last ability of Temple of Aclazotz, it's too late for
//     anyone to interrupt you by trying to remove the creature you sacrifice.

export default defineCard({
  name: "Temple of Aclazotz",
  art: "https://cards.scryfall.io/art_crop/back/c/4/c4ac7570-e74e-4081-ac53-cf41e695b7eb.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "(Transforms from Arguel's Blood Fast.)\n{T}: Add {B}.\n{T}, Sacrifice a creature: You gain life equal to the sacrificed creature's toughness.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
      resolve: null,
      text: "{T}, Sacrifice a creature: You gain life equal to the sacrificed creature's toughness.",
    },
  ],
  faces: ["Arguel's Blood Fast", "Temple of Aclazotz"],
  transform: true,
});
