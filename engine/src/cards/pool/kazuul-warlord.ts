import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 11999. Every Ally creature you control gets a counter, not just
// this one (the ruling).

const TEXT =
  "Whenever this creature or another Ally you control enters, you may put a +1/+1 counter on each Ally creature you control.";

export default defineCard({
  name: "Kazuul Warlord",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior", "Ally"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on each Ally creature you control?",
        effect: {
          kind: "add-counter-all",
          filter: { type: "creature", subtype: "Ally", controlledBy: "you" },
          counter: "+1/+1",
          amount: 1,
        },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
