import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

const PUMP: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 2, toughness: 2, duration: "end-of-turn" },
    { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "first-strike", duration: "end-of-turn" },
    { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "lifelink", duration: "end-of-turn" },
  ],
};
const PUMP_TEXT = "Creatures you control get +2/+2 and gain first strike and lifelink until end of turn.";

export default defineCard({
  name: "Soul of Theros",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n{4}{W}{W}: ${PUMP_TEXT}\n{4}{W}{W}, Exile this card from your graveyard: ${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{W}{W}", tap: false },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: `{4}{W}{W}: ${PUMP_TEXT}`,
    },
    {
      // `zone: "graveyard"` without `staysInZone`: exiling this card is part of the cost.
      cost: { mana: "{4}{W}{W}", tap: false },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: `{4}{W}{W}, Exile this card from your graveyard: ${PUMP_TEXT}`,
      zone: "graveyard",
    },
  ],
});
