import { defineCard } from "../define.js";

export default defineCard({
  name: "Leyline of Mutation",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: "If this card is in your opening hand, you may begin the game with it on the battlefield.\nYou may pay {W}{U}{B}{R}{G} rather than pay the mana cost for spells you cast.",
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: { mana: "{W}{U}{B}{R}{G}" },
      text: "You may pay {W}{U}{B}{R}{G} rather than pay the mana cost for spells you cast.",
    },
  ],
});
