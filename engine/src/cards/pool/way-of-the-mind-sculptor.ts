import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When Way of the Mind Sculptor enters, empower Jace 5. (Put five loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";
const LOYALTY_TEXT =
  "Whenever you activate a loyalty ability, if you removed two or more loyalty counters to activate it, draw a card.";

// `activates-ability`'s `removedAtLeast` (B278): the loyalty cost's size.
export default defineCard({
  name: "Way of the Mind Sculptor",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${LOYALTY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 5 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "activates-ability", who: "you", loyalty: true, removedAtLeast: 2 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: LOYALTY_TEXT,
    },
  ],
});
