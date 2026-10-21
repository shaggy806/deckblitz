import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 30418. Losing defender has no duration: for as
// long as it's on the battlefield (Surge Engine's shape). A defender granted
// later has a later timestamp and applies again, and blocking again takes
// that one away too (the ruling).

const BLOCKS_TEXT = "When this creature blocks, it loses defender.";

export default defineCard({
  name: "Elder Land Wurm",
  manaCost: "{4}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon", "Wurm"],
  power: 5,
  toughness: 5,
  keywords: ["defender", "trample"],
  text: `Defender, trample\n${BLOCKS_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "permanent" },
      resolve: null,
      text: BLOCKS_TEXT,
    },
  ],
});
