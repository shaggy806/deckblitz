import { defineCard } from "../define.js";

const TRIGGER = "At the beginning of each opponent's upkeep, if that player has one or fewer cards in hand, Davriel deals 2 damage to them.";
const DISCARD = "−1: Target player discards a card.";

export default defineCard({
  name: "Davriel, Rogue Shadowmage",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Davriel"],
  loyalty: 3,
  text: `${TRIGGER}\n${DISCARD}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atMost: 1 } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "active-player" },
      resolve: null,
      text: TRIGGER,
    },
  ],
  activated: [
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: DISCARD,
    },
  ],
});
