import { defineCard } from "../define.js";

// Streets of New Capenna. "Has base power and toughness 5/5" sets the base
// (layer 7b), so counters and pumps still apply on top.

export default defineCard({
  name: "Brokers Initiate",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Citizen"],
  power: 0,
  toughness: 4,
  text: "{4}{G/U}: This creature has base power and toughness 5/5 until end of turn.",
  activated: [
    {
      cost: { mana: "{4}{G/U}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 5,
        toughness: 5,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{4}{G/U}: This creature has base power and toughness 5/5 until end of turn.",
    },
  ],
});
