import { defineCard } from "../define.js";

export default defineCard({
  name: "Knowledge Vault",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: Exile the top card of your library face down.\n{0}: Sacrifice this artifact. If you do, discard your hand, then put all cards exiled with this artifact into their owner's hand.\nWhen this artifact leaves the battlefield, put all cards exiled with it into their owner's graveyard.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      resolve: null,
      text: "{2}, {T}: Exile the top card of your library face down.",
      targets: [],
      effect: { kind: "exile-from-library", amount: 1, faceDown: true, linked: true },
    },
    {
      cost: { mana: "{0}", tap: false },
      resolve: null,
      text: "{0}: Sacrifice this artifact. If you do, discard your hand, then put all cards exiled with this artifact into their owner's hand.",
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: {
          kind: "sequence",
          effects: [
            { kind: "discard-hand", who: "you" },
            { kind: "return-exiled-by-source", linked: "hand" },
          ],
        },
      },
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      resolve: null,
      text: "When this artifact leaves the battlefield, put all cards exiled with it into their owner's graveyard.",
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "graveyard" },
    },
  ],
});
