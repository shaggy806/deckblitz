import { defineCard } from "../define.js";

/** Disturb (rule 702.146): cast the front face normally, or the back face
 * (`Lanterns' Lift`, an Aura) from your graveyard for its disturb cost. */
export default defineCard({
  name: "Lantern Bearer",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nDisturb {2}{U} (You may cast this card from your graveyard transformed for its disturb cost.)",
  faces: ["Lantern Bearer", "Lanterns' Lift"],
  transform: true,
  disturb: { cost: "{2}{U}" },
});
