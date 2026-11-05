import { defineCard } from "../define.js";

const DISCARDED =
  "When you discard this card, you may pay {B}. When you do, return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Edgar's Awakening",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Return target creature card from your graveyard to the battlefield.\n${DISCARDED}`,
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0 },
  triggered: [
    {
      trigger: { on: "this-discarded" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to return a creature card from your graveyard to your hand?",
        cost: "{B}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
          effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          text: "Return target creature card from your graveyard to your hand.",
        },
      },
      resolve: null,
      text: DISCARDED,
    },
  ],
});
