import { defineCard } from "../define.js";

// EDHREC rank 18668.

const TEXT = "Whenever April deals combat damage to a player, draw that many cards, then discard a card.";

export default defineCard({
  name: "April, Reporter of the Weird",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { triggerValue: true } },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
