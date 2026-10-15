import { defineCard } from "../define.js";

// EDHREC rank 25808. Secrets of Strixhaven.
//
// Targeted more than once by one spell or ability, it still triggers once (the
// ruling), and the draw resolves first, even if that spell is countered.
const TARGET_TEXT =
  "Whenever this creature becomes the target of a spell or ability an opponent controls, you may draw a card.";
const INFUSION_TEXT = "Infusion — This creature gets +2/+0 as long as you gained life this turn.";

export default defineCard({
  name: "Tenured Concocter",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Druid"],
  power: 4,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${TARGET_TEXT}\n${INFUSION_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      grantPt: [2, 0],
      text: INFUSION_TEXT,
    },
  ],
});
