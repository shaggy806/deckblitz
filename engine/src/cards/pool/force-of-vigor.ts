import { defineCard } from "../define.js";

// EDHREC rank 1019.

export default defineCard({
  name: "Force of Vigor",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "If it's not your turn, you may exile a green card from your hand rather than pay this spell's mana cost.\nDestroy up to two target artifacts and/or enchantments.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["G"] }, text: "a green card" }, condition: { kind: "not", of: { kind: "your-turn" } } },
  targets: [
    { kind: "optional", of: "artifact-or-enchantment" },
    { kind: "optional", of: { kind: "other", of: "artifact-or-enchantment", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "destroy", target: 1 },
    ],
  },
});
