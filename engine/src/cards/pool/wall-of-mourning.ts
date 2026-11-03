import { defineCard } from "../define.js";

export default defineCard({
  name: "Wall of Mourning",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\nWhen this creature enters, exile a card from the top of your library face down for each opponent you have.\nCoven — At the beginning of your end step, if you control three or more creatures with different powers, put a card exiled with this creature into its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: "When this creature enters, exile a card from the top of your library face down for each opponent you have.",
      targets: [],
      effect: {
        kind: "exile-from-library",
        amount: { countPlayers: "each-opponent" },
        faceDown: true,
        linked: true,
      },
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "coven" },
      resolve: null,
      text: "Coven — At the beginning of your end step, if you control three or more creatures with different powers, put a card exiled with this creature into its owner's hand.",
      targets: [],
      // Its ruling: nobody may look, so one of them at random
      // (`faceDownGroups`, rule 406.4).
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
      },
    },
  ],
});
