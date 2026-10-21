import { defineCard } from "../define.js";

// Unctus's Retrofitter's animation, with a required target.
const TEXT =
  "When this creature enters, target artifact you control becomes an artifact creature with base power and toughness 5/5 for as long as this creature remains on the battlefield.";

export default defineCard({
  name: "Skilled Animator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 5,
        toughness: 5,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "while-source",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
