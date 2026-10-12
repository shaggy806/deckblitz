import { defineCard } from "../define.js";

// EDHREC rank 7484.

export default defineCard({
  name: "Sokka, Lateral Strategist",
  manaCost: "{1}{W/U}{W/U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 2,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever Sokka and at least one other creature attack, draw a card.",
  triggered: [
    {
      // Part of the trigger condition (rule 603.1), judged as attackers are
      // declared: Sokka and at least one other creature among them.
      trigger: { on: "attacks", who: "self" },
      whileCondition: {
        kind: "controls",
        filter: { type: "creature", attacking: true },
        atLeast: 2,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever Sokka and at least one other creature attack, draw a card.",
    },
  ],
});
