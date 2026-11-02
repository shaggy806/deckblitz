import { defineCard } from "../define.js";

const REGENERATE_TEXT = "If this creature would be destroyed, regenerate it.";
const TAP_TEXT =
  "Tap any number of untapped creatures you control other than this creature with total power 10 or greater: This creature gets +20/+20 until end of turn.";

// Crew's form of cost on an ordinary ability: which creatures is chosen as it's
// activated, and their powers add up to at least 10 (`tapOthers.totalPower`).
// Rule 701.19b for the first line: no shield, and no limit on how many times.
export default defineCard({
  name: "Mossbridge Troll",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 5,
  toughness: 5,
  text: `${REGENERATE_TEXT}\n${TAP_TEXT}`,
  static: [{ affects: { scope: "self" }, regeneratesInstead: true, text: REGENERATE_TEXT }],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 10, filter: { type: "creature", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 20, toughness: 20, duration: "end-of-turn" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
