import { defineCard } from "../define.js";

const DAMAGE_TEXT = "Whenever one or more creatures you control deal combat damage to a player, investigate.";
const ACTIVATED_TEXT = "{1}{G}, Exile a creature card from your graveyard: Investigate. You gain 2 life.";

// The batched damage trigger fires once per player dealt combat damage (the
// Two-Headed Giant ruling's "triggers twice" for two players).
export default defineCard({
  name: "Ongoing Investigation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `Whenever one or more creatures you control deal combat damage to a player, investigate. (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Clue Token", count: 1 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
