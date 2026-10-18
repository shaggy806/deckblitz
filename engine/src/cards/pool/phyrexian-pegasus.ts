import { defineCard } from "../define.js";

// EDHREC rank 17524.

const TEXT =
  "Whenever this creature attacks, another target attacking creature without flying gains flying until end of turn.";

export default defineCard({
  name: "Phyrexian Pegasus",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Pegasus"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", whose: "any", filter: { type: "creature", attacking: true, notKeyword: "flying" } },
        },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
