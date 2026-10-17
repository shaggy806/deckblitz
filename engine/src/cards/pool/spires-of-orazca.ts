import { defineCard } from "../define.js";

// Removing a creature from combat doesn't change that it attacked (the
// ruling): raid and "attacked this turn" still see it.

const REMOVE_TEXT = "{T}: Untap target attacking creature an opponent controls and remove it from combat.";

export default defineCard({
  name: "Spires of Orazca",
  art: "https://cards.scryfall.io/art_crop/back/3/9/392af78e-34d5-4b1b-8b29-0e702271e4d7.jpg",
  colors: [],
  types: ["land"],
  text: `(Transforms from Thaumatic Compass.)\n{T}: Add {C}.\n${REMOVE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "remove-from-combat", target: 0 },
        ],
      },
      resolve: null,
      text: REMOVE_TEXT,
    },
  ],
  faces: ["Thaumatic Compass", "Spires of Orazca"],
  transform: true,
});
