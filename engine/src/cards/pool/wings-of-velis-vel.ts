import { defineCard } from "../define.js";
import { EVERY_CREATURE_TYPE } from "../../subtypes.js";

export default defineCard({
  name: "Wings of Velis Vel",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["kindred", "instant"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\nUntil end of turn, target creature has base power and toughness 4/4, gains all creature types, and gains flying.",
  targets: ["creature"],
  effect: {
    kind: "animate",
    target: 0,
    power: 4,
    toughness: 4,
    addTypes: [],
    addSubtypes: [EVERY_CREATURE_TYPE],
    keywords: ["flying"],
    duration: "end-of-turn",
  },
});
