import { defineCard } from "../define.js";

// EDHREC rank 13088.
//
// Fountainport Bell's search, with "if you control a Dragon, put that card
// onto the battlefield tapped instead": whether you control one can't change
// while the search resolves, so it's read once, after the "you may", and
// picks where the found card goes. The library is shuffled either way.

const ENTERS_TEXT =
  "When this creature enters, you may search your library for a basic land card, reveal it, then shuffle and put that card on top. If you control a Dragon, put that card onto the battlefield tapped instead.";
const BASIC_LAND = { supertype: "basic", type: "land" } as const;

export default defineCard({
  name: "Embermouth Sentinel",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Chimera"],
  power: 2,
  toughness: 1,
  text: ENTERS_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "conditional",
          condition: { kind: "controls", filter: { subtype: "Dragon" }, atLeast: 1 },
          then: {
            kind: "search-library",
            filter: BASIC_LAND,
            destination: "battlefield",
            enterTapped: true,
            reveal: true,
            min: 0,
            max: 1,
          },
          else: {
            kind: "search-library",
            filter: BASIC_LAND,
            destination: "library-top",
            reveal: true,
            min: 0,
            max: 1,
          },
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
