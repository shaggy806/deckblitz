import { defineCard } from "../define.js";

// EDHREC rank 8895.

export default defineCard({
  name: "Battered Golem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 2,
  text: "This creature doesn't untap during your untap step.\nWhenever an artifact enters, you may untap this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Battered Golem?",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: "Whenever an artifact enters, you may untap this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This creature doesn't untap during your untap step.",
    },
  ],
});
