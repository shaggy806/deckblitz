import { defineCard } from "../define.js";

// EDHREC rank 25384.

export default defineCard({
  name: "Sun Ce, Young Conquerer",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nWhen Sun Ce enters, you may return target creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Return target creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: "When Sun Ce enters, you may return target creature to its owner's hand.",
    },
  ],
});
