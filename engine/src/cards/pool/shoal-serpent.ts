import { defineCard } from "../define.js";

const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, this creature loses defender until end of turn.";

export default defineCard({
  name: "Shoal Serpent",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 5,
  keywords: ["defender"],
  text: `Defender\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "end-of-turn" },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
