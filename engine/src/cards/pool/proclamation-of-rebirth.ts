import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

// Dissension (DIS). EDHREC rank 24666.
const ONE_DROP: TargetSpec = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { type: "creature", manaValue: { op: "lte", n: 1 } },
};

export default defineCard({
  name: "Proclamation of Rebirth",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return up to three target creature cards with mana value 1 or less from your graveyard to the battlefield.\nForecast — {5}{W}, Reveal this card from your hand: Return target creature card with mana value 1 or less from your graveyard to the battlefield. (Activate only during your upkeep and only once each turn.)",
  targets: [
    { kind: "optional", of: ONE_DROP },
    { kind: "optional", of: { kind: "other", of: ONE_DROP, than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: ONE_DROP, than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "put-onto-battlefield", target: 1 },
      { kind: "put-onto-battlefield", target: 2 },
    ],
  },
  activated: [
    forecast({
      cost: { mana: "{5}{W}", tap: false },
      targets: [ONE_DROP],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: "Forecast — {5}{W}, Reveal this card from your hand: Return target creature card with mana value 1 or less from your graveyard to the battlefield. (Activate only during your upkeep and only once each turn.)",
    }),
  ],
});
