import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 6813. Both modes chosen happen in order: legendary creatures
// first, then nonlegendary ones (the ruling).
const ENTER_TEXT = "When this Siege enters, choose one or both —\n• Destroy all legendary creatures.\n• Destroy all nonlegendary creatures.";

export default defineCard({
  name: "Invasion of Fiora",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 2,
        modes: [
          {
            text: "Destroy all legendary creatures.",
            effect: { kind: "destroy-all", filter: { type: "creature", supertype: "legendary" } },
          },
          {
            text: "Destroy all nonlegendary creatures.",
            effect: { kind: "destroy-all", filter: { type: "creature", notSupertype: "legendary" } },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Fiora", "Marchesa, Resolute Monarch"],
  transform: true,
});
