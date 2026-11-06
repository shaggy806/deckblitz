import { defineCard } from "../define.js";

// EDHREC rank 26048.
// The copy is of this creature as it is as the ability resolves, or as it
// last existed on the battlefield if it has left (rule 707.10).

const UPKEEP_TEXT = "At the beginning of your upkeep, create a token that's a copy of this creature.";

export default defineCard({
  name: "Troubling Tribbles",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Tribble"],
  power: 0,
  toughness: 1,
  text: `This creature can't block.\n${UPKEEP_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "This creature can't block." }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, who: "you" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
