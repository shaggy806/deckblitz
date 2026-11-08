import { defineCard } from "../define.js";

// EDHREC rank 16285. The sacrificed creature's power as it last existed (its
// ruling); the -X/-X isn't damage, so lifelink gains nothing.
const SAC_TEXT = "Sacrifice a creature: Put X +1/+1 counters on Vish Kal, where X is the sacrificed creature's power.";
const REMOVE_TEXT =
  "Remove all +1/+1 counters from Vish Kal: Target creature gets -1/-1 until end of turn for each +1/+1 counter removed this way.";

export default defineCard({
  name: "Vish Kal, Blood Arbiter",
  manaCost: "{4}{W}{B}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${SAC_TEXT}\n${REMOVE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { powerOf: { paid: "sacrificed" } } },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: "all" } },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: ["x", -1] },
        toughness: { product: ["x", -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: REMOVE_TEXT,
    },
  ],
});
