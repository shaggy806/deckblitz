import { defineCard } from "../define.js";

// EDHREC rank 17434.
//
// The draw trigger watches each creature or planeswalker you control — a
// spell targeting two of them triggers it twice (Pawpatch Recruit's shape).
const ATTACK_TEXT =
  "Whenever this creature attacks, another target attacking creature you control gains indestructible until end of turn.";
const TARGET_TEXT =
  "Whenever a creature or planeswalker you control becomes the target of a spell or ability an opponent controls, you may draw a card.";

export default defineCard({
  name: "Fey Steed",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elk"],
  power: 4,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${TARGET_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "creature", attacking: true } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: {
        on: "becomes-target",
        who: "you-control",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        byOpponentOnly: true,
      },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
});
