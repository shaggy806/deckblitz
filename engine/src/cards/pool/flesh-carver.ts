import { defineCard } from "../define.js";

// EDHREC rank 20462.
//
// X is Flesh Carver's power as it last existed on the battlefield, counters
// included (the ruling) — `powerOf: "source"` reads the last-known object
// for a dies trigger.

const SAC_TEXT = "{1}{B}, Sacrifice another creature: Put two +1/+1 counters on this creature.";
const DIES_TEXT =
  "When this creature dies, create an X/X black Horror creature token, where X is this creature's power.";

export default defineCard({
  name: "Flesh Carver",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["intimidate"],
  text: `Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\n${SAC_TEXT}\n${DIES_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: SAC_TEXT,
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Horror Token (Black 0/0)",
        count: 1,
        basePt: { power: { powerOf: "source" }, toughness: { powerOf: "source" } },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
