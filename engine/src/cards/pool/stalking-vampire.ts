import { defineCard } from "../define.js";

const TRANSFORM_TEXT =
  "At the beginning of your upkeep, you may pay {2}{B}{B}. If you do, transform this creature.";

export default defineCard({
  name: "Stalking Vampire",
  art: "https://cards.scryfall.io/art_crop/back/8/8/88db324f-11f1-43d3-a897-f4e3caf8d642.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 5,
  toughness: 5,
  text: TRANSFORM_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B}{B} to transform Stalking Vampire?",
        cost: "{2}{B}{B}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Screeching Bat", "Stalking Vampire"],
  transform: true,
});
