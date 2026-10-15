import { defineCard } from "../define.js";

const COMBAT_TEXT =
  "At the beginning of combat on your turn, another target creature you control gets +X/+0 until end of turn, where X is War Machine's power.";

export default defineCard({
  name: "War Machine, Legacy of Iron",
  manaCost: "{2}{R/W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      // X is read as the trigger resolves — War Machine's power then, or as
      // he last existed if he has left (rule 608.2h).
      effect: { kind: "modify-pt", target: 0, power: { powerOf: "source" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
