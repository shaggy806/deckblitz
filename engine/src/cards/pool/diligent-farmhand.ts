import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 12372.
//
// Its second line works only while it's in a graveyard (rule 113.6b): a resolving Muscle Burst's
// count of "cards named Muscle Burst in all graveyards" counts it (`countsAsNamedFor`).

const SEARCH_TEXT =
  "{1}{G}, Sacrifice this creature: Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.";
const NAMED_TEXT =
  "If this card is in a graveyard, effects from spells named Muscle Burst count it as a card named Muscle Burst.";

export default defineCard({
  name: "Diligent Farmhand",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: `${SEARCH_TEXT}\n${NAMED_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, fromGraveyard: true, countsAsNamedFor: "Muscle Burst", text: NAMED_TEXT }],
});
