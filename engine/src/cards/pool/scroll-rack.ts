import { defineCard } from "../define.js";

// EDHREC rank 1369.
//
// Not a draw (the ruling): an empty library gives what's there and loses
// nothing, and nothing that counts a draw sees it. Taking every card looked at
// asks nothing, and the exiled cards go back only after, so the cards taken are
// never them. The last step's order is the player's (rule 401.4).
const TEXT =
  "{1}, {T}: Exile any number of cards from your hand face down. Put that many cards from the top of your library into your hand. Then look at the exiled cards and put them on top of your library in any order.";

export default defineCard({
  name: "Scroll Rack",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      resolve: null,
      text: TEXT,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: { cardsInHand: "you" },
            destination: "exile-face-down",
            leftover: "stay",
            faceDownLooks: "chooser",
            unlinked: true,
          },
          {
            kind: "look-and-choose",
            zone: "library",
            count: { thisWay: "exiled" },
            min: { thisWay: "exiled" },
            max: { thisWay: "exiled" },
            destination: "hand",
            leftover: "stay",
          },
          {
            kind: "look-and-choose",
            zone: "exiled-this-way",
            min: { thisWay: "exiled" },
            max: { thisWay: "exiled" },
            destination: "library-top",
            leftover: "stay",
            prompt: "Put the exiled cards on top of your library in the order you pick: the first you pick goes on top",
          },
        ],
      },
    },
  ],
});
