import { defineCard } from "../define.js";

// EDHREC rank 8993.
//
// The granted attack trigger is Commander Mustard's: the enchanted creature
// deals the damage to the defending player (`trigger-player`), X their hand
// size as it resolves. "Put into **your** graveyard" fires only when the Aura
// goes to its controller's graveyard — a card goes to its owner's, so the
// leaving Aura must be one its controller owns (`ownedBy: "you"`, read as it
// last existed).
const GRANTED_TEXT =
  "Whenever this creature attacks, it deals X damage to defending player, where X is the number of cards in their hand.";
const STATIC_TEXT = `Enchanted creature has "${GRANTED_TEXT}"`;
const RETURN_TEXT = "When this Aura is put into your graveyard from the battlefield, return it to your hand.";

export default defineCard({
  name: "Unquenchable Fury",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "damage", amount: { cardsInHand: "trigger-player" }, who: "trigger-player" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"], filter: { ownedBy: "you" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
