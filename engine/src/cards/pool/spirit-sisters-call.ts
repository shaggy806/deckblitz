import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your end step, choose target permanent card in your graveyard. You may sacrifice a permanent that shares a card type with the chosen card. If you do, return the chosen card from your graveyard to the battlefield and it gains \"If this permanent would leave the battlefield, exile it instead of putting it anywhere else.\"";

export default defineCard({
  name: "Spirit-Sister's Call",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
        },
      ],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { sacrifice: { sharesCardTypeWith: 0 }, text: "Sacrifice a permanent that shares a card type with the chosen card" },
        ],
        ifDid: { kind: "put-onto-battlefield", target: 0, exileIfItWouldLeave: "ability" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
