import { defineCard } from "../define.js";

// EDHREC rank 30882. An intervening-if (rule 603.4): seven or more
// permanents, this one included, as the trigger fires and as it resolves.

const TEXT =
  "At the beginning of your upkeep, if you control seven or more permanents, return this creature to its owner's hand.";

export default defineCard({
  name: "Complex Automaton",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: {}, atLeast: 7 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
