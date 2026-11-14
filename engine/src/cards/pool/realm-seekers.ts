import { defineCard } from "../define.js";

// EDHREC rank 9487.
const ENTERS_TEXT =
  "This creature enters with X +1/+1 counters on it, where X is the total number of cards in all players' hands.";
const SEARCH_TEXT =
  "{2}{G}, Remove a +1/+1 counter from this creature: Search your library for a land card, reveal it, put it into your hand, then shuffle.";

/**
 * Realm Seekers. X is read as it enters (rule 614.12), so a hand emptied in
 * response while it's on the stack gives fewer counters; put onto the
 * battlefield straight from a hand without being cast, it counts itself
 * there (the rulings — `Game.enteringCounterAmount`'s hand, as a graveyard's).
 */
export default defineCard({
  name: "Realm Seekers",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${SEARCH_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "search-library", filter: { type: "land" }, destination: "hand", min: 0, max: 1, reveal: true },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { cardsInHand: "each-player" } },
      },
      text: ENTERS_TEXT,
    },
  ],
});
