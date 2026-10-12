import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";
import type { EffectAmount } from "../../effects.js";

// X is counted as the ability resolves (the ruling), the Gryff included.
const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, it gets +X/+X until end of turn, where X is the number of Mounts you control.";
const MOUNTS: EffectAmount = { countOf: { subtype: "Mount", controlledBy: "you" } };

export default defineCard({
  name: "Congregation Gryff",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Hippogriff", "Mount"],
  power: 1,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${ATTACK_TEXT}\n${saddleText(3)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: MOUNTS, toughness: MOUNTS, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(3, saddleText(3))],
});
