import { defineCard } from "../define.js";

// EDHREC rank 23060.
const COMBAT_TEXT = "At the beginning of combat on your turn, exile up to one target card from a graveyard.";

export default defineCard({
  name: "Startled Relic Sloth",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Sloth", "Beast"],
  power: 4,
  toughness: 4,
  keywords: ["trample", "lifelink"],
  text: `Trample, lifelink\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
