import { defineCard } from "../define.js";

// EDHREC rank 29720.
//
// "As this creature enters" (rules 614.1c, 614.12): the other artifact cards
// are chosen and revealed from the hand as it's about to enter
// (`asEnters.reveal`, rule 701.20a), staying there; a +1/+1 counter for each,
// `"done-as-enters"`. Put onto the battlefield from the hand, it isn't one of
// the cards it can reveal ("other").
const TEXT =
  "As this creature enters, you may reveal any number of other artifact cards from your hand. This creature enters with a +1/+1 counter on it for each card revealed this way.";

export default defineCard({
  name: "Arsenal Thresher",
  manaCost: "{2}{W/B}{U}",
  colors: ["W", "B", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { reveal: { filter: { type: "artifact" } } },
        counters: { kind: "+1/+1", amount: "done-as-enters" },
      },
      text: TEXT,
    },
  ],
});
