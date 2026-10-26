import { defineCard } from "../define.js";

// EDHREC rank 29692.
//
// An intervening if (rule 603.4): checked as it triggers and again as it
// resolves (the ruling).

const TEXT = "When this creature enters, if you control an enchantment, you gain 3 life.";

export default defineCard({
  name: "Lagonna-Band Elder",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Centaur", "Advisor"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
