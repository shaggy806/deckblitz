import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, search your library for a basic Plains card and reveal it. If an opponent controls more lands than you, put it onto the battlefield tapped. Otherwise, put it into your hand. Then shuffle.";

const PLAINS = { supertype: "basic", subtype: "Plains" } as const;

export default defineCard({
  name: "Stoic Farmer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Peasant"],
  power: 3,
  toughness: 3,
  text: `${ETB_TEXT}\nForetell {1}{W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Searching moves no land, so asking "more lands" before the search is
      // the same answer as asking after it.
      effect: {
        kind: "conditional",
        condition: { kind: "opponent-controls-more", filter: { type: "land" } },
        then: {
          kind: "search-library",
          filter: PLAINS,
          destination: "battlefield",
          enterTapped: true,
          reveal: true,
          min: 0,
          max: 1,
        },
        else: { kind: "search-library", filter: PLAINS, destination: "hand", reveal: true, min: 0, max: 1 },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  foretell: { cost: "{1}{W}" },
});
