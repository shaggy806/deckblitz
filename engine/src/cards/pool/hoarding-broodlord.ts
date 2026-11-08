import { defineCard } from "../define.js";

const ENTER =
  "When this creature enters, search your library for a card, exile it face down, then shuffle. For as long as that card remains exiled, you may play it.";
const CONVOKE = "Spells you cast from exile have convoke.";

export default defineCard({
  name: "Hoarding Broodlord",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 7,
  toughness: 6,
  keywords: ["flying"],
  convoke: true,
  text: `Convoke\nFlying\n${ENTER}\n${CONVOKE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // The permission is the searcher's for as long as the card stays exiled,
      // whoever controls the Broodlord later (the rulings).
      effect: {
        kind: "search-library",
        filter: {},
        destination: "exile-face-down",
        mayPlay: { duration: "while-exiled", play: true },
        min: 1,
        max: 1,
      },
      resolve: null,
      text: ENTER,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { castFrom: ["exile"], convoke: true },
      text: CONVOKE,
    },
  ],
});
