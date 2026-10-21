import { defineCard } from "../define.js";

const TEXT = "When this creature enters, if you control an artifact, draw a card.";

export default defineCard({
  name: "Scholar of Stars",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
