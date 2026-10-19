import { defineCard } from "../define.js";

// The Brothers' War. "This creature or another creature you control" is one
// creature-you-control enters trigger that counts itself.
const ENTERS_TEXT =
  "Whenever this creature or another creature you control enters, target creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Fallaji Vanguard",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
