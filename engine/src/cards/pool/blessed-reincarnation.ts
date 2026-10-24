import { defineCard } from "../define.js";

export default defineCard({
  name: "Blessed Reincarnation",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  rebound: true,
  text: "Exile target creature an opponent controls. That player reveals cards from the top of their library until a creature card is revealed. The player puts that card onto the battlefield, then shuffles the rest into their library.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "reveal-until",
        whose: { controllerOfTarget: 0 },
        filter: { type: "creature" },
        put: "battlefield",
        rest: "shuffle",
      },
    ],
  },
});
