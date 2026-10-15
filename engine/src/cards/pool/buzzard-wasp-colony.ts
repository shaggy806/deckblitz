import { defineCard } from "../define.js";

// EDHREC rank 15226.
//
// Rulings:
//   [2025-11-21] Buzzard-Wasp Colony's last ability puts all counters that were on the creature
//     that died onto Buzzard-Wasp Colony, not just its +1/+1 counters.
//   [2025-11-21] Buzzard-Wasp Colony's last ability doesn't cause you to move counters from the
//     creature that died onto it. Rather, you put the same number of each kind of counter the
//     creature had when it died onto Buzzard-Wasp Colony.
//   [2025-11-21] If another creature you control has -1/-1 counters on it when it dies, Buzzard-
//     Wasp Colony's ability will include those as well.
//
// "An artifact or creature" may be the Colony itself. The dead creature's
// counters are read as it last existed (The Ozolith's shape), -1/-1 ones too.
const ENTER_TEXT = "When this creature enters, you may sacrifice an artifact or creature. If you do, draw a card.";
const DIES_TEXT =
  "Whenever another creature you control dies, if it had counters on it, put its counters on this creature.";

export default defineCard({
  name: "Buzzard-Wasp Colony",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird", "Insect"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { typesAnyOf: ["artifact", "creature"] }, text: "Sacrifice an artifact or creature" }],
        ifDid: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "put-counters-of", of: "trigger-object", target: "source" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
