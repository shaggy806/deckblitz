import { defineCard } from "../define.js";

// Spirit Link's trigger — once per damage event, "that much" the total (rule
// 603.2c, the Angel of Deliverance and Vessel of the All-Consuming rulings)
// — and Rancor's return, from the battlefield only.
const LIFE_TEXT = "Whenever enchanted creature deals damage, you gain that much life.";
const RETURN_TEXT = "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.";

export default defineCard({
  name: "Spirit Loop",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${LIFE_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: LIFE_TEXT,
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
