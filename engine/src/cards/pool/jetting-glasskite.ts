import { defineCard } from "../define.js";

// EDHREC rank 31530. Saviors of Kamigawa. Kira, Great Glass-Spinner's granted
// trigger, printed.
const COUNTER =
  "Whenever this creature becomes the target of a spell or ability for the first time each turn, counter that spell or ability.";

export default defineCard({
  name: "Jetting Glasskite",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${COUNTER}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "ward", cost: null },
      resolve: null,
      text: COUNTER,
    },
  ],
});
