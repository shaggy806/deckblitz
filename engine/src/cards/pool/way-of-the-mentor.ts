import { defineCard } from "../define.js";

export default defineCard({
  name: "Way of the Mentor",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: "When Way of the Mentor enters, empower Jace 5. (Put five loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")\nWhenever you gain life, put a loyalty counter on each planeswalker you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 5 },
      resolve: null,
      text: "When Way of the Mentor enters, empower Jace 5.",
    },
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "planeswalker", controlledBy: "you" },
        counter: "loyalty",
        amount: 1,
      },
      resolve: null,
      text: "Whenever you gain life, put a loyalty counter on each planeswalker you control.",
    },
  ],
});
