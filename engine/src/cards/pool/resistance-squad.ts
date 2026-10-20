import { defineCard } from "../define.js";

// An intervening if (rule 603.4): another Human is needed both as it enters
// and as the ability resolves (the ruling).
const ETB_TEXT = "When this creature enters, if you control another Human, draw a card.";

export default defineCard({
  name: "Resistance Squad",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Human" }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
