import { defineCard } from "../define.js";

// EDHREC rank 24408. Secrets of Strixhaven.
//
// Infusion isn't an intervening "if": the ability triggers and its target is
// chosen whether or not you gained life this turn, and it asks as it resolves
// (the ruling).
const INFUSION_TEXT =
  "Infusion — When this creature enters, target creature an opponent controls gets -4/-4 until end of turn if you gained life this turn.";

export default defineCard({
  name: "Poisoner's Apprentice",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warlock"],
  power: 2,
  toughness: 2,
  text: INFUSION_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
        then: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
      },
      resolve: null,
      text: INFUSION_TEXT,
    },
  ],
});
