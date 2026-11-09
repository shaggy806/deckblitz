import { defineCard } from "../define.js";
import { flanking } from "../helpers.js";

const REGENERATE_TEXT = "If this creature would be destroyed, regenerate it. (Tap it, remove it from combat, and heal all damage on it.)";
const NO_REGEN_TEXT = "{2}: This creature can't be regenerated this turn. Only your opponents may activate this ability.";

export default defineCard({
  name: "Knight of the Holy Nimbus",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: `Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n${REGENERATE_TEXT}\n${NO_REGEN_TEXT}`,
  triggered: [flanking()],
  static: [{ affects: { scope: "self" }, regeneratesInstead: true, text: REGENERATE_TEXT }],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "cant-regenerate", target: "source" },
      resolve: null,
      text: NO_REGEN_TEXT,
      onlyOpponents: true,
    },
  ],
});
