import { defineCard } from "../define.js";

// EDHREC rank 14076.
//
// The land is the ability's only target: with it gone illegal the ability
// doesn't resolve at all (rule 608.2b), its own counters included.
const TEXT =
  "Exhaust — {6}: Put two +1/+1 counters on this creature, then earthbend 2. (Target land you control becomes a 0/0 creature with haste that's still a land. Put two +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped. Activate each exhaust ability only once.)";

export default defineCard({
  name: "Rebellious Captives",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Peasant", "Ally"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: ["land-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          { kind: "earthbend", target: 0, amount: 2 },
        ],
      },
      resolve: null,
      text: "Exhaust — {6}: Put two +1/+1 counters on this creature, then earthbend 2.",
      exhaust: true,
    },
  ],
});
