import { defineCard } from "../define.js";

const TEXT =
  "{3}{U}: Target opponent reveals a card at random from their hand. If it's an instant or sorcery card, exile it. You may cast it without paying its mana cost for as long as it remains exiled. At the beginning of the next end step, if you haven't cast it, return it to its owner's hand. Activate only as a sorcery.";

export default defineCard({
  name: "Planeswalker's Mischief",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      resolve: null,
      sorcerySpeed: true,
      text: TEXT,
      targets: ["opponent"],
      effect: {
        kind: "choose-random-card",
        zone: "hand",
        whose: 0,
        show: "reveal",
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { typesAnyOf: ["instant", "sorcery"] } },
          then: {
            kind: "sequence",
            effects: [
              { kind: "exile", target: 0, fromHand: true },
              { kind: "allow-cast-from-exile", target: 0, free: true, whileExiled: true },
              // Cast, it has left exile: a new object the return can't reach
              // (rule 400.7), and so "if you haven't cast it".
              { kind: "delayed-trigger", at: "next-end-step", text: "Return it to its owner's hand.", effect: { kind: "return-to-hand", target: 0, from: "exile" } },
            ],
          },
        },
      },
    },
  ],
});
