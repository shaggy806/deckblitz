import { defineCard } from "../define.js";

// EDHREC rank 12266.
//
// "Becomes a Frog" replaces its creature types (layer 4); its base power and
// toughness are set to 3/3 (layer 7b), so counters and pumps still apply on
// top, and it keeps its abilities (the rulings).

const TEXT = "{T}: Target creature becomes a Frog with base power and toughness 3/3 until end of turn.";

export default defineCard({
  name: "Omnibian",
  manaCost: "{1}{G}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Frog"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "animate",
        target: 0,
        power: 3,
        toughness: 3,
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Frog"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
