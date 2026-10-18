import { defineCard } from "../define.js";
import { SIEGE_REMINDER, distinctTargets, siege } from "../helpers.js";

// EDHREC rank 21062.

const ENTER_TEXT =
  "When this Siege enters, up to two target creatures each get +2/+0 and gain vigilance and haste until end of turn.";

const pump = (slot: number) =>
  [
    { kind: "modify-pt", target: slot, power: 2, toughness: 0, duration: "end-of-turn" },
    { kind: "grant-keyword", target: slot, keyword: "vigilance", duration: "end-of-turn" },
    { kind: "grant-keyword", target: slot, keyword: "haste", duration: "end-of-turn" },
  ] as const;

export default defineCard({
  name: "Invasion of Kylem",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 5,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(2, "creature", { optional: true }),
      effect: { kind: "sequence", effects: [...pump(0), ...pump(1)] },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Kylem", "Valor's Reach Tag Team"],
  transform: true,
});
