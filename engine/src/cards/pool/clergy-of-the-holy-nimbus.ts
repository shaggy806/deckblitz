import { defineCard } from "../define.js";

const REGENERATE_TEXT = "If this creature would be destroyed, regenerate it.";
const LOCK_TEXT =
  "{1}: This creature can't be regenerated this turn. Only your opponents may activate this ability.";

export default defineCard({
  name: "Clergy of the Holy Nimbus",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: `${REGENERATE_TEXT}\n${LOCK_TEXT}`,
  static: [{ affects: { scope: "self" }, regeneratesInstead: true, text: REGENERATE_TEXT }],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "prohibit", target: "source", regeneration: true },
      resolve: null,
      anyPlayer: true,
      onlyOpponents: true,
      text: LOCK_TEXT,
    },
  ],
});
