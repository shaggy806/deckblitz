import { defineCard } from "../define.js";

const exceptHaste = { notKeyword: "haste" } as const;

export default defineCard({
  name: "Run for Your Life",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "One or two target creatures each gain haste until end of turn. They can't be blocked this turn except by creatures with haste.\nEscape—{2}{U}{R}, Exile four other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  escape: { cost: "{2}{U}{R}", exileCount: 4 },
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "haste", duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: exceptHaste },
      { kind: "restrict", target: 1, restrictions: [], cantBeBlockedBy: exceptHaste },
    ],
  },
});
