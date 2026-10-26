import { defineCard } from "../define.js";

// EDHREC rank 23575.
//
// Rulings:
//   [2013-09-15] If the green creature an opponent controls is an illegal target when Hunt the
//     Hunter tries to resolve, but the green creature you control is still a legal target, the
//     creature you control will get +2/+2, but the creatures won't fight. Neither creature will
//     deal or be dealt damage.
//   [2013-09-15] You must target both a green creature you control and a green creature an
//     opponent controls to cast Hunt the Hunter.

// Wild Instincts' shape, both targets green.
export default defineCard({
  name: "Hunt the Hunter",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target green creature you control gets +2/+2 until end of turn. It fights target green creature an opponent controls.",
  targets: [
    { kind: "permanent", whose: "you", filter: { colors: ["G"], type: "creature" } },
    { kind: "permanent", whose: "opponent", filter: { colors: ["G"], type: "creature" } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
