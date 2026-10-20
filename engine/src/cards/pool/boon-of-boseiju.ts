import { defineCard } from "../define.js";

// EDHREC rank 12317.
//
// Rulings:
//   [2022-02-18] The greatest mana value among permanents you control is determined as Boon of
//     Boseiju resolves.
//   [2022-02-18] Transforming double-faced permanents, such as those found in this set, have the
//     mana value of their front face at all times, even while back-face-up.
//   [2022-02-18] If a permanent on the battlefield has {X} in its mana cost, X is 0 when
//     determining that permanent's mana value.
//
// X is read once, as the pump is applied (Tyvar, the Pummeler's aggregate,
// over mana value and every permanent you control).
const GREATEST_MV = { aggregate: "max", of: "mana-value", filter: { controlledBy: "you" } } as const;

export default defineCard({
  name: "Boon of Boseiju",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +X/+X until end of turn, where X is the greatest mana value among permanents you control. Untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: GREATEST_MV, toughness: GREATEST_MV, duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});
