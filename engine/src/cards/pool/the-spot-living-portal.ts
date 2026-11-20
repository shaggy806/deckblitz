import { defineCard } from "../define.js";

// The enters trigger exiles each target linked to The Spot (rule 607.2a). His
// dies trigger finds him in the graveyard he went to (`trigger-object`, as
// Chaos, the Endless does) and puts him on the bottom; "if you do" is a card
// put into a library this way (`put-into-library`, counted by its owner). A
// token The Spot leaves the graveyard as it's put there (rule 111.7) — no card
// goes into the library, so the exiled cards stay (the ruling). The exiled
// cards are those linked to the battlefield stint the trigger refers to, so
// moving him first doesn't lose them.

const ENTER_TEXT =
  "When The Spot enters, exile up to one target nonland permanent and up to one target nonland permanent card from a graveyard.";
const DIES_TEXT =
  "When The Spot dies, put him on the bottom of his owner's library. If you do, return the exiled cards to their owners' hands.";

export default defineCard({
  name: "The Spot, Living Portal",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "nonland-permanent" },
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "any", filter: { notTypes: ["land", "instant", "sorcery"] } },
        },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0, linked: true },
          { kind: "exile", target: 1, linked: true },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-on-library", target: "trigger-object", position: "bottom" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-into-library" },
            then: { kind: "return-exiled-by-source", linked: "hand" },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
