import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// Mystery Booster Commander. The count is read as the attack trigger
// resolves, and the bonus goes to the creatures you control then.
const ATTACK =
  "Whenever Tsagan attacks, creatures you control get +1/+0 until end of turn for each creature you control with first strike or double strike.";
const MAX = "Max speed — Tsagan has deathtouch and other creatures you control have first strike.";

export default defineCard({
  name: "Tsagan, Raider Warlord",
  manaCost: "{R}{W}{B}",
  colors: ["R", "W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Berserker"],
  power: 1,
  toughness: 4,
  keywords: ["double-strike", "start-your-engines"],
  text: `Double strike\n${START_YOUR_ENGINES_TEXT}\n${ATTACK}\n${MAX}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: {
          countOf: {
            type: "creature",
            controlledBy: "you",
            anyOf: [{ keyword: "first-strike" }, { keyword: "double-strike" }],
          },
        },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
  static: [
    maxSpeed({ grantKeywords: ["deathtouch"], text: MAX }),
    maxSpeed(
      { grantKeywords: ["first-strike"], text: MAX },
      { scope: "creatures-you-control", excludeSelf: true },
    ),
  ],
});
