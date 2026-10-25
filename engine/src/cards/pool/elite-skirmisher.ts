import { defineCard } from "../define.js";

// EDHREC rank 27350.

const TEXT = "Heroic — Whenever you cast a spell that targets this creature, you may tap target creature.";

export default defineCard({
  name: "Elite Skirmisher",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: ["creature"],
      effect: { kind: "may", prompt: "Tap the target creature?", effect: { kind: "tap", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
