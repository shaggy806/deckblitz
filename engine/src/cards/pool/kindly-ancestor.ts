import { defineCard } from "../define.js";

/** Disturb (rule 702.146): cast the front face normally, or the back face
 * (`Ancestor's Embrace`, an Aura) from your graveyard for its disturb cost. */
export default defineCard({
  name: "Kindly Ancestor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: "Lifelink\nDisturb {1}{W} (You may cast this card from your graveyard transformed for its disturb cost.)",
  faces: ["Kindly Ancestor", "Ancestor's Embrace"],
  transform: true,
  disturb: { cost: "{1}{W}" },
});
