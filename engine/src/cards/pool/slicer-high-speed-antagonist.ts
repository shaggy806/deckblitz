import { defineCard } from "../define.js";

// The back face of Slicer, Hired Muscle, cast converted by its More Than Meets
// the Eye (rule 702.162a). Living metal (702.161a): during your turn it's an
// artifact creature as well. "Convert it at end of combat" is a delayed
// trigger that turns it over (701.28a), only if it hasn't converted since the
// trigger was made (701.28e).
//
// Rulings:
//   [2022-10-14] While it's a creature, the Vehicle has its printed power and toughness.
//   [2022-10-14] The mana value of a converted permanent on the battlefield is equal to the mana
//     value of the card's front face, no matter which face is up.

const LIVING_METAL_TEXT = "Living metal (During your turn, this Vehicle is also a creature.)";
const DAMAGE_TEXT = "Whenever Slicer deals combat damage to a player, convert it at end of combat.";

export default defineCard({
  name: "Slicer, High-Speed Antagonist",
  // A back face has no Scryfall card of its own name — point at its art.
  art: "https://cards.scryfall.io/art_crop/back/9/d/9d9a9350-4734-4cc1-986d-467e6715199f.jpg",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike", "haste"],
  text: `${LIVING_METAL_TEXT}\nFirst strike, haste\n${DAMAGE_TEXT}`,
  faces: ["Slicer, Hired Muscle", "Slicer, High-Speed Antagonist"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{2}{R}" },
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      addTypes: ["creature"],
      text: LIVING_METAL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "transform", target: "source" },
        text: "At end of combat, convert Slicer.",
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
