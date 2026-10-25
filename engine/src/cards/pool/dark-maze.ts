import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 30608. The delayed exile tracks the Maze's
// stint (`sourceStint`): one that has left and come back is a new object.

const TEXT =
  "{0}: This creature can attack this turn as though it didn't have defender. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Dark Maze",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 4,
  toughness: 5,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attack-despite-defender", target: "source" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "exile", target: "source" },
            text: "Exile Dark Maze.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
