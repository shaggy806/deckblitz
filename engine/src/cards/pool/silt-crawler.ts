import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 30761.

const TEXT = "When this creature enters, tap all lands you control.";

export default defineCard({
  name: "Silt Crawler",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "land", controlledBy: "you" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
