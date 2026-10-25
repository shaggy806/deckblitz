import { defineCard } from "../define.js";

// EDHREC rank 30614. Alliances.
//
// The leaves trigger reads the +1/+1 counters it had as it left (last-known
// information), so a Sphere sacrificed at upkeep gives the Orb the counter it
// just got.

export default defineCard({
  name: "Phantasmal Sphere",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, put a +1/+1 counter on this creature, then sacrifice this creature unless you pay {1} for each +1/+1 counter on it.\nWhen this creature leaves the battlefield, target opponent creates an X/X blue Orb creature token with flying, where X is the number of +1/+1 counters on this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "unless",
            chooser: "you",
            options: [{ payGeneric: { countersOn: "source", counter: "+1/+1" }, text: "Pay {X}" }],
            otherwise: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, put a +1/+1 counter on this creature, then sacrifice this creature unless you pay {1} for each +1/+1 counter on it.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "create-token",
        token: "Orb Token",
        count: 1,
        who: "target-controller",
        basePt: {
          power: { countersOn: "source", counter: "+1/+1" },
          toughness: { countersOn: "source", counter: "+1/+1" },
        },
      },
      resolve: null,
      text: "When this creature leaves the battlefield, target opponent creates an X/X blue Orb creature token with flying, where X is the number of +1/+1 counters on this creature.",
    },
  ],
});
