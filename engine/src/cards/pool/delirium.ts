import { defineCard } from "../define.js";

// EDHREC rank 11950.
//
// "That player" is the opponent whose turn it is. The tap is part of the
// effect, so a tapped creature can be targeted (the ruling).

export default defineCard({
  name: "Delirium",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Cast this spell only during an opponent's turn.\nTap target creature that player controls. That creature deals damage equal to its power to the player. Prevent all combat damage that would be dealt to and dealt by the creature this turn.",
  castOnlyIf: { kind: "not", of: { kind: "your-turn" } },
  targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "active-player" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "damage", amount: { powerOf: 0 }, who: "active-player", from: { target: 0 } },
      { kind: "damage-rule", to: { target: 0 }, combat: true },
      { kind: "damage-rule", by: { target: 0 }, combat: true },
    ],
  },
});
