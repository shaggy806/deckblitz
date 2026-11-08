import { defineCard } from "../define.js";

const TEXT =
  "Whenever you gain life, you may put that many +1/+1 counters on each creature you control. Do this only once each turn.";

// "Do this only once each turn" (rule 603.2h, B278): once its counters have
// been put this turn the ability doesn't trigger again; a declined one
// doesn't count (its rulings). Each Paragon has its own once.
export default defineCard({
  name: "Nykthos Paragon",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put that many +1/+1 counters on each creature you control?",
        oncePerTurn: true,
        effect: {
          kind: "add-counter-all",
          filter: { type: "creature", controlledBy: "you" },
          counter: "+1/+1",
          amount: { triggerValue: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
