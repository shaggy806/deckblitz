import { defineCard } from "../define.js";

const TEXT = "When this creature enters, it deals damage to any target equal to twice the number of Goblins it devoured.";

// Each devoured creature's types as it last existed on the battlefield (the
// ruling), so a changeling is a Goblin.
export default defineCard({
  name: "Voracious Dragon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  devour: { multiplier: 1, filter: { type: "creature" } },
  text: `Flying\nDevour 1 (As this creature enters, you may sacrifice any number of creatures. It enters with that many +1/+1 counters on it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: { product: [2, { devoured: "source", filter: { subtype: "Goblin" } }] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
