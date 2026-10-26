import { defineCard } from "../define.js";

// EDHREC rank 30079.
//
// Its owner shuffles even if it has left the graveyard by then, where it
// stays (the ruling).

const TEXT = "When this creature dies, you may shuffle it into its owner's library.";

export default defineCard({
  name: "Angel of Fury",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Shuffle Angel of Fury into its owner's library?",
        effect: { kind: "shuffle-into-library", target: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
