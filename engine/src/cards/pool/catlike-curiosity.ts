import { defineCard } from "../define.js";

/** The disturb back face of Mischievous Catgeist, an Aura. Its "exile it
 * instead" is the face's own ability (`self`). */
const GRANT_TEXT =
  "Enchanted creature has \"Whenever this creature deals combat damage to a player, draw a card.\"";
const EXILE_TEXT = "If Catlike Curiosity would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Catlike Curiosity",
  art: "https://cards.scryfall.io/art_crop/back/a/3/a3ff628a-ef8e-45c4-84e7-a33ec28f025a.jpg",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "Whenever this creature deals combat damage to a player, draw a card.",
        },
      ],
      text: GRANT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Mischievous Catgeist", "Catlike Curiosity"],
  transform: true,
  disturb: { cost: "{2}{U}" },
});
