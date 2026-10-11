import { defineCard } from "../define.js";

// Rulings:
//   If you cast this as normal during your main phase, it will enter the battlefield and you'll
//     receive priority. If no abilities trigger because of this, you can activate its ability
//     immediately, before any other player has a chance to remove it from the battlefield.
// Both are costs, paid as the ability is activated (rule 602.2h): the
// enchantment is back in its owner's hand before anyone can respond, and the
// target is chosen before the sacrifice (602.2b), so the creature sacrificed
// can't be the one returned.
const TEXT =
  "Sacrifice a creature, Return this enchantment to its owner's hand: Return target creature card from your graveyard to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Recurring Nightmare",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control", returnSelfToHand: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: TEXT,
    },
  ],
});
