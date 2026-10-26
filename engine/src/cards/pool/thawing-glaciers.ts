import { defineCard } from "../define.js";

export default defineCard({
  name: "Thawing Glaciers",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{1}, {T}: Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle. Return this land to its owner's hand at the beginning of the next cleanup step.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { type: "land", supertype: "basic" },
            destination: "battlefield",
            min: 0,
            max: 1,
            enterTapped: true,
          },
          {
            kind: "delayed-trigger",
            at: "next-cleanup",
            effect: { kind: "return-to-hand", target: "source" },
            text: "Return Thawing Glaciers to its owner's hand.",
          },
        ],
      },
      resolve: null,
      text: "{1}, {T}: Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle. Return this land to its owner's hand at the beginning of the next cleanup step.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
