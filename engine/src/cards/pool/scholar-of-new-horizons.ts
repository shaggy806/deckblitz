import { defineCard } from "../define.js";

// EDHREC rank 2647.
//
// Rulings:
//   [2023-04-14] You may choose to put the card into your hand rather than onto the battlefield
//     even if an opponent controls more lands than you.
//
// The cost's counter comes off any permanent you control, of any kind, chosen
// as it's paid (`removeCounter`'s `from`, `kind: "any"`). The found Plains
// may go onto the battlefield tapped while an opponent controls more lands
// (`instead`, `pick: "any"` — the searcher's choice), into the hand otherwise.
const ENTER_TEXT = "This creature enters with a +1/+1 counter on it.";
const SEARCH_TEXT =
  "{T}, Remove a counter from a permanent you control: Search your library for a Plains card and reveal it. If an opponent controls more lands than you, you may put that card onto the battlefield tapped. If you don't put the card onto the battlefield, put it into your hand. Then shuffle.";

export default defineCard({
  name: "Scholar of New Horizons",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${SEARCH_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "any", count: 1, from: {} } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Plains" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
        instead: {
          destination: "battlefield",
          enterTapped: true,
          condition: { kind: "opponent-controls-more", filter: { type: "land" } },
          pick: "any",
        },
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
