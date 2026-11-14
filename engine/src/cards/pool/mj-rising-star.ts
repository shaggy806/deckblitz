import { defineCard } from "../define.js";

// EDHREC rank 15532.
const LIFE_TEXT = "Whenever you gain life, put a +1/+1 counter on MJ.";

export default defineCard({
  name: "MJ, Rising Star",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Performer"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${LIFE_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
