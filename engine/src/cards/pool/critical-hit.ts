import { defineCard } from "../define.js";

const NATURAL_TEXT = "When you roll a natural 20, return this card from your graveyard to your hand. (A natural 20 is a roll that displays 20 on the die.)";

export default defineCard({
  name: "Critical Hit",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Target creature gains double strike until end of turn.\n${NATURAL_TEXT}`,
  targets: ["creature"],
  effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
  triggered: [
    {
      trigger: { on: "event", event: "rolls-die", who: "you", die: { natural: 20 } },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: NATURAL_TEXT,
    },
  ],
});
