import { defineCard } from "../define.js";

const TEXT =
  "{T}: Look at the top card of target player's library. If it's a nonland card, you may pay 2 life. If you do, put it into that player's graveyard.";

export default defineCard({
  name: "Wand of Denial",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 1,
        // Only a nonland card is chosen, and being chosen asks nothing: the
        // "you may" is the payment. A land is only looked at.
        min: 1,
        max: 1,
        filter: { notTypes: ["land"] },
        destination: "stay",
        leftover: "stay",
        then: {
          kind: "may",
          prompt: "Pay 2 life to put that card into its owner's graveyard?",
          costLife: 2,
          effect: { kind: "put-into-graveyard", target: 0 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
