import { defineCard } from "../define.js";

// The ruling: none of the lands is a target. They're chosen one player at a
// time and destroyed together; each controller of one actually destroyed (an
// indestructible land wasn't) then may search, in turn order (rule 101.4).
const TEXT =
  "When this creature enters, for each player, destroy up to one nonbasic land that player controls. For each land destroyed this way, its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Krenko's Buzzcrusher",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Insect", "Thopter"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            who: "you",
            for: {
              permanent: { type: "land", notSupertype: "basic" },
              about: "each-player",
              upTo: 1,
              prompt: "Destroy up to one nonbasic land",
            },
          },
          {
            kind: "for-each-voted",
            which: "voted",
            simultaneous: true,
            effect: { kind: "destroy", target: 0 },
          },
          {
            kind: "each-player-may",
            who: "each-player",
            prompt: "Search your library for a basic land card?",
            effect: {
              kind: "conditional",
              condition: { kind: "this-way", what: "destroyed", who: "you", filter: { type: "land" }, atLeast: 1 },
              then: {
                kind: "search-library",
                filter: { type: "land", supertype: "basic" },
                destination: "battlefield",
                enterTapped: true,
                min: 0,
                max: { thisWay: "destroyed", who: "you", filter: { type: "land" } },
              },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
