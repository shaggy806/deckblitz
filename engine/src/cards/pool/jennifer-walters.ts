import { defineCard } from "../define.js";

// EDHREC rank 7383. A modal DFC whose front can transform into its back face,
// The Sensational She-Hulk (Bruce Banner's shape).

const LOCK_TEXT = "Your opponents can't cast spells during your turn.";
const TRANSFORM_TEXT = "{3}{G}{W}{W}: Transform Jennifer Walters. Activate only as a sorcery.";

export default defineCard({
  name: "Jennifer Walters",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor", "Hero"],
  power: 2,
  toughness: 3,
  text: `${LOCK_TEXT}\n${TRANSFORM_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      prohibits: { who: "opponents", spells: true },
      text: LOCK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}{W}{W}", tap: false },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Jennifer Walters", "The Sensational She-Hulk"],
});
