import { defineCard } from "../define.js";

// EDHREC rank 21436. "When you discard this card" works from the graveyard
// the discard puts it in (rule 113.6k), whatever made you discard it — your
// own effect or cost, an opponent's, or the cleanup step.

const GAIN = "Whenever you gain life, put two +1/+1 counters on Titanbones.";
const DISCARD = "When you discard this card, you gain 3 life.";

export default defineCard({
  name: "Titanbones, Towering Heart",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Skeleton", "Druid"],
  power: 4,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${GAIN}\n${DISCARD}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: GAIN,
    },
    {
      trigger: { on: "this-discarded" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: DISCARD,
    },
  ],
});
