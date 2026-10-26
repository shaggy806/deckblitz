import { defineCard } from "../define.js";

const TEXT = "When this creature enters, if you control a green permanent, draw a card.";

export default defineCard({
  name: "Rhox Meditant",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino", "Monk"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // Intervening if (rule 603.4): checked as it triggers and as it resolves.
      condition: { kind: "controls", filter: { colors: ["G"] }, atLeast: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
