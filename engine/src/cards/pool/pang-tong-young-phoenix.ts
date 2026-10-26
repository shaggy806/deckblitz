import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

const TEXT =
  "{T}: Target creature gets +0/+2 until end of turn. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Pang Tong, \"Young Phoenix\"",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      condition: BEFORE_ATTACKERS_DECLARED,
      text: TEXT,
    },
  ],
});
