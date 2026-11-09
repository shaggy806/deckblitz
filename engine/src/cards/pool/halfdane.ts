import { defineCard } from "../define.js";

// The last upkeep's effect lasts through this upkeep's trigger, so with no new
// target he keeps that size only until this upkeep ends (rule 500.5).
const TEXT =
  "At the beginning of your upkeep, Halfdane's base power and toughness become equal to the power and toughness of target creature other than Halfdane until the end of your next upkeep.";

export default defineCard({
  name: "Halfdane",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "become",
        target: "source",
        power: { powerOf: 0 },
        toughness: { toughnessOf: 0 },
        duration: "until-end-of-your-next-upkeep",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
