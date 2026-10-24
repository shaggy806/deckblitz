import { defineCard } from "../define.js";

// EDHREC rank 7720.
//
// Rulings:
//   You choose all of your modes at once. You can't choose any one mode multiple times.
//   If two of the chosen modes target a player (or opponent), you may choose the same player for
//     each mode's target, or different ones.
//   If one target of an escalate spell becomes illegal, the other targets will still be
//     affected.
//
// Escalate is Collective Resistance's `costPerExtraMode`. The first mode is
// Steal the Show's "discards …, then draws that many": a `discard` of the
// target's whole hand (`cardsInHand: "each"` reads the targeted player's), then
// a draw of what was discarded this way.

export default defineCard({
  name: "Collective Defiance",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Escalate {1} (Pay this cost for each mode chosen beyond the first.)\nChoose one or more —\n• Target player discards all the cards in their hand, then draws that many cards.\n• Collective Defiance deals 4 damage to target creature.\n• Collective Defiance deals 3 damage to target opponent or planeswalker.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 3,
    costPerExtraMode: "{1}",
    modes: [
      {
        text: "Target player discards all the cards in their hand, then draws that many cards.",
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: 0, amount: { cardsInHand: "each" } },
            { kind: "draw", target: 0, amount: { thisWay: "discarded" } },
          ],
        },
      },
      {
        text: "Collective Defiance deals 4 damage to target creature.",
        targets: ["creature"],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      {
        text: "Collective Defiance deals 3 damage to target opponent or planeswalker.",
        targets: ["opponent-or-planeswalker"],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
    ],
  },
});
