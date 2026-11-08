import { defineCard } from "../define.js";

// EDHREC rank 5531.
//
// Rulings:
//   [2025-11-17] Only the opponents of Oft-Nabbed Goat's controller can activate its first
//     ability. For the purposes of the first ability, it doesn't matter who owns Oft-Nabbed Goat.

export default defineCard({
  name: "Oft-Nabbed Goat",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goat"],
  power: 0,
  toughness: 5,
  text: "{1}: Draw a card. Gain control of this creature and put a -1/-1 counter on it. Only your opponents may activate this ability and only as a sorcery.\nWhen this creature dies, if it had one or more -1/-1 counters on it, its owner draws that many cards and each other player loses that much life.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "gain-control", target: "source", untilEndOfTurn: false },
          { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 },
        ],
      },
      resolve: null,
      text: "{1}: Draw a card. Gain control of this creature and put a -1/-1 counter on it. Only your opponents may activate this ability and only as a sorcery.",
      anyPlayer: true,
      onlyOpponents: true,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "-1/-1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { countersOn: "source", counter: "-1/-1" }, who: { ownerOf: "source" } },
          { kind: "lose-life", amount: { countersOn: "source", counter: "-1/-1" }, who: { otherThan: { ownerOf: "source" } } },
        ],
      },
      resolve: null,
      text: "When this creature dies, if it had one or more -1/-1 counters on it, its owner draws that many cards and each other player loses that much life.",
    },
  ],
});
