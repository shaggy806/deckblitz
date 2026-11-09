import { defineCard } from "../define.js";

// Graveyard order (rule 404.2): `top-of-graveyard` with a filter, then Dawn of the Dead's
// shape with the card as target 0. No target, so it's only looked for as this resolves.

export default defineCard({
  name: "Corpse Dance",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Buyback {2}\nReturn the top creature card of your graveyard to the battlefield. That creature gains haste until end of turn. Exile it at the beginning of the next end step.",
  targets: [],
  kicker: { cost: "{2}", keyword: "buyback" },
  effect: {
    kind: "top-of-graveyard",
    filter: { type: "creature" },
    then: {
      kind: "sequence",
      effects: [
        { kind: "put-onto-battlefield", target: 0 },
        { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        {
          kind: "delayed-trigger",
          at: { step: "end" },
          effect: { kind: "exile", target: 0 },
          text: "Exile it.",
        },
      ],
    },
  },
});
