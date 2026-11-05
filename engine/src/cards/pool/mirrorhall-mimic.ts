import { defineCard } from "../define.js";

/** Disturb (rule 702.146): the back face, Ghastly Mimicry, is cast from the
 * graveyard transformed. The front copies "except it's a Spirit in addition to
 * its other types" (a copy exception, so a copy of it is a Spirit too). */
export default defineCard({
  name: "Mirrorhall Mimic",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  disturb: { cost: "{3}{U}{U}" },
  copyOnEnter: { filter: { type: "creature" }, except: { addSubtypes: ["Spirit"] } },
  text: "You may have this creature enter as a copy of any creature on the battlefield, except it's a Spirit in addition to its other types.\nDisturb {3}{U}{U} (You may cast this card from your graveyard transformed for its disturb cost.)",
  faces: ["Mirrorhall Mimic", "Ghastly Mimicry"],
  transform: true,
});
