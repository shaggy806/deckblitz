import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 25035.
//
// Rulings:
//   [2022-10-14] If you activate a card's unearth ability but that card is removed from your
//     graveyard before the ability resolves, that unearth ability will do nothing as it resolves.
//   [2022-10-14] At the beginning of the next end step, a permanent returned to the battlefield
//     with unearth is exiled. This is a delayed triggered ability.
//
// The upkeep tax is Gateway Plaza's `unless`: pay {3} or it's tapped.
const UPKEEP_TEXT = "At the beginning of your upkeep, tap this creature unless you pay {3}.";

export default defineCard({
  name: "Heavyweight Demolisher",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 8,
  toughness: 6,
  keywords: ["menace"],
  text: `Menace\n${UPKEEP_TEXT}\nUnearth {6}{R}{R} ({6}{R}{R}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{3}", text: "Pay {3}." }],
        otherwise: { kind: "tap", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [unearth("{6}{R}{R}")],
});
