import { defineCard } from "../define.js";

// EDHREC rank 16622.
const ATTACK_TEXT = "Whenever Appa attacks, another target attacking creature without flying gains flying until end of turn.";

export default defineCard({
  name: "Appa, Aang's Companion",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bison", "Ally"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${ATTACK_TEXT}`,
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
      text: ATTACK_TEXT,
    },
  ],
});
