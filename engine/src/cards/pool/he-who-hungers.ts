import { defineCard } from "../define.js";
import { soulshift } from "../helpers.js";

// EDHREC rank 18277. Corpse Traders' ability, sacrificing a Spirit (itself included).
//
// Rulings:
//   [2013-04-15] If you cast this as normal during your main phase, it will enter the battlefield
//     and you'll receive priority. If no abilities trigger because of this, you can activate its
//     ability immediately, before any other player has a chance to remove it from the battlefield.

const DISCARD_TEXT =
  "{1}, Sacrifice a Spirit: Target opponent reveals their hand. You choose a card from it. That player discards that card. Activate only as a sorcery.";

export default defineCard({
  name: "He Who Hungers",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DISCARD_TEXT}\nSoulshift 4 (When this creature dies, you may return target Spirit card with mana value 4 or less from your graveyard to your hand.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { subtype: "Spirit" } } },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0 },
      resolve: null,
      text: DISCARD_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [soulshift(4)],
});
