import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";
import type { EffectSpec } from "../../effects.js";

// "When this creature enters and whenever it attacks while saddled" is one
// ability with two trigger events (`sameAbilityAs`); the attack half only
// while it's saddled as it attacks (the rulings).
const TEXT = "When this creature enters and whenever it attacks while saddled, create a 3/3 green Elephant creature token.";
const ELEPHANT: EffectSpec = { kind: "create-token", token: "Elephant Token", count: 1 };

export default defineCard({
  name: "Autarch Mammoth",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant", "Mount"],
  power: 5,
  toughness: 5,
  text: `${TEXT}\n${saddleText(5)}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: ELEPHANT, resolve: null, text: TEXT },
    { ...ATTACKS_WHILE_SADDLED, sameAbilityAs: 0, targets: [], effect: ELEPHANT, resolve: null, text: TEXT },
  ],
  activated: [saddle(5, saddleText(5))],
});
