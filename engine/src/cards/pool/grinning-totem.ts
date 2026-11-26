import { defineCard } from "../define.js";

// EDHREC rank 21470.
//
// Praetor's Grasp's search of an opponent's library, exiled face up with
// Elkin Bottle's "until the beginning of your next upkeep" permission; then
// Glimpse the Impossible's delayed trigger about the card exiled this way. A
// card played has left exile, a new object (rule 400.7), so "if you haven't
// played it" is the card still being the one exiled: `put-into-graveyard`
// acts only on that. Into its owner's graveyard: the opponent's.
const TEXT =
  "{2}, {T}, Sacrifice this artifact: Search target opponent's library for a card and exile it. Then that player shuffles. Until the beginning of your next upkeep, you may play that card. At the beginning of your next upkeep, if you haven't played it, put it into its owner's graveyard.";

export default defineCard({
  name: "Grinning Totem",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            whose: { target: 0 },
            filter: {},
            destination: "exile",
            mayPlay: { duration: "until-your-next-upkeep", play: true },
            min: 1,
            max: 1,
          },
          {
            kind: "delayed-trigger",
            at: { step: "upkeep", whose: "you" },
            about: "exiled",
            effect: { kind: "for-each-target", from: 0, effect: { kind: "put-into-graveyard", target: 0 } },
            text: "At the beginning of your next upkeep, if you haven't played it, put it into its owner's graveyard.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
