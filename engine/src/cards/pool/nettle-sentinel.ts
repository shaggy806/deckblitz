import { defineCard } from "../define.js";

// EDHREC rank 18761.
//
// Rulings:
//   [2008-08-01] Nettle Sentinel's triggered ability resolves before the spell that caused it to
//     trigger. The ability will resolve even if that spell is countered.

const UNTAP_STEP_TEXT = "This creature doesn't untap during your untap step.";
const UNTAP_TEXT = "Whenever you cast a green spell, you may untap this creature.";

export default defineCard({
  name: "Nettle Sentinel",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${UNTAP_STEP_TEXT}\n${UNTAP_TEXT}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["G"] } },
      targets: [],
      effect: { kind: "may", prompt: "Untap Nettle Sentinel?", effect: { kind: "untap", target: "source" } },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
