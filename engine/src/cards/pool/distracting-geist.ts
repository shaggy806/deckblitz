import { defineCard } from "../define.js";

/** Disturb (rule 702.146): cast the front face normally, or the back face
 * (`Clever Distraction`, an Aura) from your graveyard for its disturb cost.
 * The tap targets only a creature the player this creature attacks controls
 * (the ruling). */
const ATTACK_TEXT = "Whenever this creature attacks, tap target creature defending player controls.";

export default defineCard({
  name: "Distracting Geist",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: `${ATTACK_TEXT}\nDisturb {4}{W} (You may cast this card from your graveyard transformed for its disturb cost.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Distracting Geist", "Clever Distraction"],
  transform: true,
  disturb: { cost: "{4}{W}" },
});
