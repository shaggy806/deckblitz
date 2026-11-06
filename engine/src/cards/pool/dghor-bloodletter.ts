import { defineCard } from "../define.js";

// EDHREC rank 28961.

const ENTER_TEXT = "When this creature enters, choose one —";

export default defineCard({
  name: "D'Ghor Bloodletter",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Klingon", "Assassin"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n• All other creatures get -1/-1 until end of turn.\n• Each player sacrifices a creature of their choice.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "All other creatures get -1/-1 until end of turn.",
            effect: {
              kind: "modify-pt-all",
              filter: { type: "creature" },
              power: -1,
              toughness: -1,
              duration: "end-of-turn",
              exceptSource: true,
            },
          },
          {
            text: "Each player sacrifices a creature of their choice.",
            effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
