import { defineCard } from "../define.js";

// EDHREC rank 7858.
//
// Rulings:
//   If you don't pay the overload cost of a spell with overload, that spell will have a single
//     target. If you pay the overload cost, the spell won't have any targets.
//   Because a spell with overload doesn't target when its overload cost is paid, it may affect
//     permanents with hexproof or with protection from the appropriate color.
//   If you are instructed to cast a spell with overload "without paying its mana cost," you can't
//     choose to pay its overload cost instead.
//
// Mizzium Mortars' overload shape: "each creature you control".

export default defineCard({
  name: "Mizzium Skin",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature you control gets +0/+1 and gains hexproof until end of turn.\nOverload {1}{U} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 0, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
    ],
  },
  overload: {
    cost: "{1}{U}",
    effect: {
      kind: "sequence",
      effects: [
        {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 0,
          toughness: 1,
          duration: "end-of-turn",
        },
        {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "hexproof",
          duration: "end-of-turn",
        },
      ],
    },
  },
});
