import { defineCard } from "../define.js";

// EDHREC rank 28731.

export default defineCard({
  name: "Grotesque Hybrid",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature deals combat damage to a creature, destroy that creature. It can't be regenerated.\nDiscard a card: This creature gains flying and protection from green and from white until end of turn.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient", cantBeRegenerated: true },
      resolve: null,
      text: "Whenever this creature deals combat damage to a creature, destroy that creature. It can't be regenerated.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-protection", target: "source", from: { colors: ["G", "W"] }, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Discard a card: This creature gains flying and protection from green and from white until end of turn.",
    },
  ],
});
