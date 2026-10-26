import { defineCard } from "../define.js";
import { soulshift } from "../helpers.js";

// EDHREC rank 25045.

export default defineCard({
  name: "Kami of the Honored Dead",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature is dealt damage, you gain that much life.\nSoulshift 6 (When this creature dies, you may return target Spirit card with mana value 6 or less from your graveyard to your hand.)",
  triggered: [
    {
      // Metropolis Reformer's trigger.
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever this creature is dealt damage, you gain that much life.",
    },
    soulshift(6),
  ],
});
