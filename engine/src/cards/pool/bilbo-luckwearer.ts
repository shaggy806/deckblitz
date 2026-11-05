import { defineCard } from "../define.js";

// EDHREC rank 11104.

export default defineCard({
  name: "Bilbo, Luckwearer",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Rogue"],
  power: 1,
  toughness: 1,
  text: "Bilbo can't be blocked.\nWhenever Bilbo deals combat damage to a player, draw a card, then discard a card.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "Whenever Bilbo deals combat damage to a player, draw a card, then discard a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "Bilbo can't be blocked.",
    },
  ],
  faces: ["Bilbo, Luckwearer", "Burglar's Plot"],
  adventure: true,
});
