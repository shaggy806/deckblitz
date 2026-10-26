import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 21459.

export default defineCard({
  name: "Rune of Protection: White",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  cycling: { cost: "{2}" },
  text: "{W}: The next time a white source of your choice would deal damage to you this turn, prevent that damage.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { colors: ["W"] },
        to: "you",
        amount: "next-time",
      },
      resolve: null,
      text: "{W}: The next time a white source of your choice would deal damage to you this turn, prevent that damage.",
    },
  ],
});
