import { defineCard } from "../define.js";

const RECAST =
  "Whenever one or more creatures you control deal combat damage to a player, if this card is in your graveyard, you may pay {2}{R}{R}{R}. If you do, you may cast it without paying its mana cost.";

// Once per player dealt combat damage in a damage step (its ruling). First
// the payment, then — as a second choice — the cast (its ruling): `cast-now`
// is itself optional.
export default defineCard({
  name: "Thunderblade Charge",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Thunderblade Charge deals 3 damage to any target.\n${RECAST}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
  triggered: [
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{R}{R}{R} to cast Thunderblade Charge without paying its mana cost?",
        cost: "{2}{R}{R}{R}",
        effect: { kind: "cast-now", target: "source", free: true },
      },
      resolve: null,
      text: RECAST,
    },
  ],
});
