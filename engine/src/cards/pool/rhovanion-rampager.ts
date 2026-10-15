import { defineCard } from "../define.js";

// EDHREC rank 14679.
// Makes Goblin Army by amassing → the engine's "Army Token".
//
// Rulings:
//   [2026-06-29] Use the sacrificed creature's power as it last existed on the battlefield to
//     determine how many counters Rhovanion Rampager gets.
//   [2026-06-29] To amass Goblins N, if you don't control an Army creature, create a 0/0 black
//     Goblin Army creature token. Then you choose an Army creature you control and put N +1/+1
//     counters on it. If that Army isn't already a Goblin, it becomes a Goblin in addition to its
//     other types.
// "Where X is this creature's power" in its own dies trigger is the power it died with
// (last-known information, rule 608.2h).

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice another creature. If you do, put a number of +1/+1 counters on this creature equal to the sacrificed creature's power.";
const DIES_TEXT = "When this creature dies, amass Goblins X, where X is this creature's power.";

export default defineCard({
  name: "Rhovanion Rampager",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${DIES_TEXT} (Put X +1/+1 counters on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { powerOf: "sacrificed" } },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: { powerOf: "source" }, creatureType: "Goblin" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
