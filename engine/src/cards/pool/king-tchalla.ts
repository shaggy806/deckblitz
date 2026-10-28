import { defineCard } from "../define.js";

// EDHREC rank 5658. A modal DFC whose front transforms into its back face,
// Black Panther, Hope Enduring — Bruce Banner's shape.

const DRAW_TEXT = "Whenever a player draws their second card each turn, you draw a card.";
const TRANSFORM_TEXT = "{4}{W}{U}: Transform King T'Challa. Activate only as a sorcery.";

export default defineCard({
  name: "King T'Challa",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Hero"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${DRAW_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "any", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{W}{U}", tap: false },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["King T'Challa", "Black Panther, Hope Enduring"],
});
