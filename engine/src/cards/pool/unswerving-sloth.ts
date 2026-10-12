import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

// Untapped, the attackers are still attacking (rule 506.4) — and the
// creatures that saddled it are untapped too.
const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, it gains indestructible until end of turn. Untap all creatures you control.";

export default defineCard({
  name: "Unswerving Sloth",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sloth", "Mount"],
  power: 5,
  toughness: 5,
  text: `${ATTACK_TEXT}\n${saddleText(4)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(4, saddleText(4))],
});
