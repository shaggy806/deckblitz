import { defineCard } from "../define.js";

const INSPIRATION_TEXT = "Bardic Inspiration — Target creature gets +2/+2 until end of turn.";
const REST_TEXT = "Song of Rest — You gain 3 life.";

export default defineCard({
  name: "Inspiring Bard",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Bard"],
  power: 3,
  toughness: 3,
  text: `When this creature enters, choose one —\n• ${INSPIRATION_TEXT}\n• ${REST_TEXT}`,
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
            text: INSPIRATION_TEXT,
            targets: ["creature"],
            effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          },
          { text: REST_TEXT, effect: { kind: "gain-life", amount: 3 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
