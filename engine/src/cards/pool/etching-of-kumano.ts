import { defineCard } from "../define.js";

// Kumano Faces Kakkazan's back face. Garruk, Veiled Butcher's dies-to-exile
// replacement, for any creature dealt damage this turn by a source its
// controller controlled then (Shelob's `damagedThisTurnBy`, read off the
// damage history as the source was when it dealt the damage).

const REPLACE_TEXT = "If a creature dealt damage this turn by a source you controlled would die, exile it instead.";

export default defineCard({
  name: "Etching of Kumano",
  art: "https://cards.scryfall.io/art_crop/back/2/8/28d92cad-45b0-479d-97fc-c175f3a3f259.jpg",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${REPLACE_TEXT}`,
  faces: ["Kumano Faces Kakkazan", "Etching of Kumano"],
  transform: true,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", damagedThisTurnBy: { controlledBy: "you" } },
      },
      text: REPLACE_TEXT,
    },
  ],
});
