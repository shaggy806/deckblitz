import { defineCard } from "../define.js";

const TEXT =
  "{T}: Draw a card, then exile a card from your hand face down. You may look at that card for as long as it remains exiled. You may pay {4}{U}{U}. If you do, transform Jacob Hauken.";

export default defineCard({
  name: "Jacob Hauken, Inspector",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 0,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 1,
            max: 1,
            destination: "exile-face-down",
            leftover: "stay",
            faceDownLooks: "chooser",
          },
          {
            kind: "may",
            prompt: "Pay {4}{U}{U} to transform Jacob Hauken?",
            cost: "{4}{U}{U}",
            effect: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Jacob Hauken, Inspector", "Hauken's Insight"],
  transform: true,
});
