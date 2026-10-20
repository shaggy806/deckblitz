import { defineCard } from "../define.js";

// EDHREC rank 25747.

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, this creature can attack this turn as though it didn't have defender.";

export default defineCard({
  name: "Skyclave Squid",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Squid"],
  power: 3,
  toughness: 2,
  keywords: ["defender"],
  text: `Defender\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "attack-despite-defender", target: "source" },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
