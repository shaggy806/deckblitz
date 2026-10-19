import { defineCard } from "../define.js";
import { hideaway, playHideawayCard } from "../helpers.js";

// Hideaway (rule 702.75): the exiled card is linked to this enchantment
// (607.2a). The Treasure is made first, so it can help pay the {W}{U}{B}{R}{G}
// (the ruling); paying is a "may", and the play after it another.
const CAST_TEXT =
  "Whenever you cast a multicolored spell, create a Treasure token. Then you may pay {W}{U}{B}{R}{G}. If you do, you may play the exiled card without paying its mana cost.";

export default defineCard({
  name: "Widespread Thieving",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text:
    "Hideaway 5 (When this enchantment enters, look at the top five cards of your library, exile one face down, then put the rest on the bottom in a random order.)\n" +
    CAST_TEXT,
  triggered: [
    hideaway(5, "enchantment"),
    {
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Treasure Token", count: 1 },
          {
            kind: "may",
            prompt: "Pay {W}{U}{B}{R}{G} to play the exiled card without paying its mana cost?",
            cost: "{W}{U}{B}{R}{G}",
            effect: playHideawayCard(),
          },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
