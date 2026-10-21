import { defineCard } from "../define.js";

// Rulings:
//   [2011-01-01] The last ability will trigger no matter how Glistening Oil is put into the
//     graveyard from the battlefield, not just when the enchanted creature is put into the graveyard.

const INFECT_TEXT = "Enchanted creature has infect.";
const UPKEEP_TEXT = "At the beginning of your upkeep, put a -1/-1 counter on enchanted creature.";
const RETURN_TEXT = "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.";

export default defineCard({
  name: "Glistening Oil",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${INFECT_TEXT}\n${UPKEEP_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["infect"], text: INFECT_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
