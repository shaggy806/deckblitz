import { defineCard } from "../define.js";

// EDHREC rank 20765. Fate Reforged.

export default defineCard({
  name: "Goblin Heelcutter",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 3,
  toughness: 2,
  dash: { cost: "{2}{R}" },
  text: "Whenever this creature attacks, target creature can't block this turn.\nDash {2}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "Whenever this creature attacks, target creature can't block this turn.",
    },
  ],
});
