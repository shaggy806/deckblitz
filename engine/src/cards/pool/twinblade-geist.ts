import { defineCard } from "../define.js";

/** Disturb (rule 702.146): cast the front face normally, or the back face
 * (`Twinblade Invocation`, an Aura) from your graveyard for its disturb cost. */
export default defineCard({
  name: "Twinblade Geist",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  text: "Double strike\nDisturb {2}{W} (You may cast this card from your graveyard transformed for its disturb cost.)",
  faces: ["Twinblade Geist", "Twinblade Invocation"],
  transform: true,
  disturb: { cost: "{2}{W}" },
});
