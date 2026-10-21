import { defineCard } from "../define.js";

const TEXT =
  "When this creature dies, if you control a Vraska planeswalker, you gain life equal to this creature's power.";

export default defineCard({
  name: "Attendant of Vraska",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      // An intervening "if" (rule 603.4): checked again as it resolves, so a
      // Vraska that left at the same time gives no life (the rulings). Its
      // power as it last existed on the battlefield.
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Vraska" }, atLeast: 1 },
      targets: [],
      effect: { kind: "gain-life", amount: { powerOf: "source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
