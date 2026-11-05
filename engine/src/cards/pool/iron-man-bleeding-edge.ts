import { defineCard } from "../define.js";

// EDHREC rank 9504.

export default defineCard({
  name: "Iron Man, Bleeding Edge",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever you cast an artifact spell, you may copy it, except the copy isn't legendary. Do this only once each turn. (The copy becomes a token.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy it, except the copy isn't legendary?",
        effect: { kind: "copy-spell", target: "trigger-spell", except: { notLegendary: true } },
        oncePerTurn: true,
      },
      resolve: null,
      text: "Whenever you cast an artifact spell, you may copy it, except the copy isn't legendary. Do this only once each turn.",
    },
  ],
});
