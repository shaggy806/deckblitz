import { defineCard } from "../define.js";

/** Disturb (rule 702.146): cast the front face normally, or the back face
 * (`Spectral Binding`, an Aura) from your graveyard for its disturb cost. */
const ATTACK_TEXT = "Whenever this creature attacks, target creature an opponent controls gets -2/-0 until end of turn.";

export default defineCard({
  name: "Binding Geist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 1,
  text: `${ATTACK_TEXT}\nDisturb {1}{U} (You may cast this card from your graveyard transformed for its disturb cost.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Binding Geist", "Spectral Binding"],
  transform: true,
  disturb: { cost: "{1}{U}" },
});
