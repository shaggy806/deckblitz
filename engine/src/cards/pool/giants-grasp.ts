import { defineCard } from "../define.js";

const TEXT =
  "When this Aura enters, gain control of target nonland permanent for as long as this Aura remains on the battlefield.";

export default defineCard({
  name: "Giant's Grasp",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Giant you control\n${TEXT}`,
  targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Giant" } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent"],
      // Ends as the Aura leaves, whoever controls it meanwhile, and does
      // nothing if it's already gone (the rulings) — Sower of Temptation's.
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSource: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
