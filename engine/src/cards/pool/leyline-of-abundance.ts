import { defineCard } from "../define.js";

// EDHREC rank 3012.

export default defineCard({
  name: "Leyline of Abundance",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: "If this card is in your opening hand, you may begin the game with it on the battlefield.\nWhenever you tap a creature for mana, add an additional {G}.\n{6}{G}{G}: Put a +1/+1 counter on each creature you control.",
  activated: [
    {
      cost: { mana: "{6}{G}{G}", tap: false },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "{6}{G}{G}: Put a +1/+1 counter on each creature you control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "Whenever you tap a creature for mana, add an additional {G}.",
    },
  ],
});
