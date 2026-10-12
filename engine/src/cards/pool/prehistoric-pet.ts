import { defineCard } from "../define.js";

// EDHREC rank 12538.
//
// Rulings:
//   [2026-01-27] Once Prehistoric Pet has been blocked, changing its power or the power of a
//     blocking creature won't cause it to become unblocked.
//
// Ant-Man, Elusive Avenger's evasion: the powers are compared as blockers are
// declared, and only then (the ruling).
const EVADE_TEXT = "This creature can't be blocked by creatures with greater power.";
const BOUNCE_TEXT =
  "{1}{W}, {T}: Return another target creature you control to its owner's hand. Activate only during your turn.";

export default defineCard({
  name: "Prehistoric Pet",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Ninja"],
  power: 1,
  toughness: 2,
  text: `${EVADE_TEXT}\n${BOUNCE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
      text: EVADE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      condition: { kind: "your-turn" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
