import { defineCard } from "../define.js";

// EDHREC rank 25767.
//
// Rulings:
//   [2022-09-09] Ghitu Amplifier's last triggered ability resolves before the spell that caused it
//     to trigger. The ability will resolve even if that spell is countered.

const ETB_TEXT =
  "When this creature enters, if it was kicked, return target creature an opponent controls to its owner's hand.";
const CAST_TEXT = "Whenever you cast an instant or sorcery spell, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Ghitu Amplifier",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: `Kicker {2}{U} (You may pay an additional {2}{U} as you cast this spell.)\n${ETB_TEXT}\n${CAST_TEXT}`,
  kicker: { cost: "{2}{U}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
