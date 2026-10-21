import { defineCard } from "../define.js";

// EDHREC rank 26869.
const TEXT =
  "Whenever this creature attacks, target attacking creature without flying gains flying until end of turn.";

export default defineCard({
  name: "Roc Charger",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        { kind: "permanent", whose: "any", filter: { type: "creature", attacking: true, notKeyword: "flying" } },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
