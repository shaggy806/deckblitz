import { defineCard } from "../define.js";

const ENTERS =
  "When this creature enters, you may search your library for any number of land cards, exile them, then shuffle. If you do, this creature has base power and base toughness each equal to the number of cards exiled this way.";

// "If you do" is the search: one that finds nothing still sets it to 0/0.
// The count is read once, as it resolves — a card leaving exile later
// changes nothing; declining leaves it 6/6 (the rulings).
export default defineCard({
  name: "Trench Gorger",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for any number of land cards and exile them?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "search-library", filter: { type: "land" }, destination: "exile", min: 0, max: { librarySize: "you" } },
            {
              kind: "become",
              target: "source",
              power: { thisWay: "exiled" },
              toughness: { thisWay: "exiled" },
              duration: "permanent",
            },
          ],
        },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
