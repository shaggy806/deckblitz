import { defineCard } from "../define.js";

export default defineCard({
  name: "Cabal Interrogator",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{X}{B}, {T}: Target player reveals X cards from their hand and you choose one of them. That player discards that card. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{X}{B}", tap: true },
      sorcerySpeed: true,
      targets: ["player"],
      effect: { kind: "discard-chosen", target: 0, reveals: "x" },
      resolve: null,
      text: "{X}{B}, {T}: Target player reveals X cards from their hand and you choose one of them. That player discards that card. Activate only as a sorcery.",
    },
  ],
});
