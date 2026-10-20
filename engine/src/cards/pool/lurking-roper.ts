import { defineCard } from "../define.js";

// EDHREC rank 25179.

export default defineCard({
  name: "Lurking Roper",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 5,
  text: "This creature doesn't untap during your untap step.\nWhenever you gain life, untap this creature.",
  static: [
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This creature doesn't untap during your untap step.",
    },
  ],
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever you gain life, untap this creature.",
    },
  ],
});
