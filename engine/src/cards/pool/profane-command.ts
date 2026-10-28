import { defineCard } from "../define.js";

const LOSE_TEXT = "Target player loses X life.";
const RETURN_TEXT = "Return target creature card with mana value X or less from your graveyard to the battlefield.";
const SHRINK_TEXT = "Target creature gets -X/-X until end of turn.";
const FEAR_TEXT =
  "Up to X target creatures gain fear until end of turn. (They can't be blocked except by artifact creatures and/or black creatures.)";

// The fear group is the last mode, so with any other mode its targets come
// last (rule 700.2); the graveyard slot's filter reads the X cast (Confront the
// Past).
export default defineCard({
  name: "Profane Command",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Choose two —\n• ${LOSE_TEXT}\n• ${RETURN_TEXT}\n• ${SHRINK_TEXT}\n• ${FEAR_TEXT}`,
  targets: [],
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: LOSE_TEXT,
        targets: ["player"],
        effect: { kind: "lose-life", amount: "x", target: 0 },
      },
      {
        text: RETURN_TEXT,
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { type: "creature", manaValue: { op: "lte", n: "x" } },
          },
        ],
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      {
        text: SHRINK_TEXT,
        targets: ["creature"],
        effect: {
          kind: "modify-pt",
          target: 0,
          power: { product: ["x", -1] },
          toughness: { product: ["x", -1] },
          duration: "end-of-turn",
        },
      },
      {
        text: FEAR_TEXT,
        targets: [{ kind: "any-number", of: "creature", max: "x" }],
        effect: {
          kind: "for-each-target",
          from: 0,
          effect: { kind: "grant-keyword", target: 0, keyword: "fear", duration: "end-of-turn" },
        },
      },
    ],
  },
});
