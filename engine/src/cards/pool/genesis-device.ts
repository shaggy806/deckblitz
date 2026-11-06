import { defineCard } from "../define.js";

// EDHREC rank 27646.

const ENTER_TEXT =
  "When Genesis Device enters, search your library for a basic land card or Planet card, put it onto the battlefield tapped, then shuffle.";
const SAC_TEXT =
  "{3}{G}{G}, {T}, Sacrifice Genesis Device: Sacrifice any number of lands you control, then search your library for up to that many land cards, put them onto the battlefield tapped, then shuffle. Activate only as a sorcery.";

export default defineCard({
  name: "Genesis Device",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{G}{G}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "land", controlledBy: "you" },
            upTo: { countOf: { type: "land", controlledBy: "you" } },
            then: { kind: "sacrifice-target", target: 0 },
            prompt: "Sacrifice any number of lands",
          },
          {
            kind: "search-library",
            filter: { type: "land" },
            destination: "battlefield",
            enterTapped: true,
            min: 0,
            max: { thisWay: "sacrificed" },
          },
        ],
      },
      resolve: null,
      sorcerySpeed: true,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { anyOf: [{ type: "land", supertype: "basic" }, { subtype: "Planet" }] },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
