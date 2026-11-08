import { defineCard } from "../define.js";

const TEXT =
  "{T}: Target artifact creature's controller sacrifices it. That player may search their library for a noncreature artifact card, put it onto the battlefield, then shuffle.";

// "That player": the creature's controller as it last existed (rule 608.2h), who
// may decline, and then neither searches nor shuffles.
export default defineCard({
  name: "Arcum Dagsson",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-target", target: 0, byItsController: true },
          {
            kind: "each-player-may",
            who: { controllerOf: 0 },
            prompt: "Search your library for a noncreature artifact card?",
            effect: {
              kind: "search-library",
              filter: { type: "artifact", notTypes: ["creature"] },
              destination: "battlefield",
              min: 0,
              max: 1,
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
