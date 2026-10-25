import { defineCard } from "../define.js";

// EDHREC rank 19010.
//
// The vote first, then the counters, then the life (the ruling). Each result
// is one instruction for its total — two counters per sprout vote put at
// once, one life gain of 3 per harvest vote — so a "whenever you gain life"
// trigger fires once, as it would for the printed sentence. If this creature
// has left the battlefield, the sprout votes do nothing (the ruling).

const TEXT =
  "Council's dilemma — When this creature enters, starting with you, each player votes for sprout or harvest. Put two +1/+1 counters on this creature for each sprout vote. You gain 3 life for each harvest vote.";

export default defineCard({
  name: "Orchard Elemental",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["sprout", "harvest"] } },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { product: [2, { votesFor: 0 }] },
          },
          { kind: "gain-life", amount: { product: [3, { votesFor: 1 }] } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
