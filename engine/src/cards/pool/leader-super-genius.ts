import { defineCard } from "../define.js";

const REPLACE_TEXT = "If a creature you control would connive, instead you draw a card, then that creature connives.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, target creature you control connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)";

// `StaticAbility.conniveDrawsFirst` (B278): a replacement applied once per
// such ability as a creature of its controller's connives (rule 614.5).
export default defineCard({
  name: "Leader, Super-Genius",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gamma", "Scientist", "Villain"],
  power: 1,
  toughness: 3,
  text: `${REPLACE_TEXT}\n${COMBAT_TEXT}`,
  static: [{ affects: { scope: "self" }, conniveDrawsFirst: true, text: REPLACE_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "connive", target: 0 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
