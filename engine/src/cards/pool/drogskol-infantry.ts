import { defineCard } from "../define.js";

/** Disturb (rule 702.146): cast the front face normally, or the back face
 * (`Drogskol Armaments`, an Aura) from your graveyard for its disturb cost. */
export default defineCard({
  name: "Drogskol Infantry",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Disturb {3}{W} (You may cast this card from your graveyard transformed for its disturb cost.)",
  faces: ["Drogskol Infantry", "Drogskol Armaments"],
  transform: true,
  disturb: { cost: "{3}{W}" },
});
