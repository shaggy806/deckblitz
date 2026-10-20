import { defineCard } from "../define.js";
import { training } from "../helpers.js";

// EDHREC rank 16107.
//
// Partner with (rule 702.124j): the pair's search trigger, as the other
// partner-with cards author it.

const SAC_TEXT = "Whenever you sacrifice a Clue or Food, put a +1/+1 counter on another target creature you control.";

export default defineCard({
  name: "Jenny Flint",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  pairing: { kind: "partner-with", name: "Madame Vastra" },
  text: `Partner with Madame Vastra\nFirst strike\nTraining (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Madame Vastra?",
        effect: {
          kind: "search-library",
          filter: { name: "Madame Vastra" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Madame Vastra, reveal it, put it into their hand, then shuffle.",
    },
    training(),
    {
      trigger: { on: "sacrifice", who: "you", filter: { anyOf: [{ subtype: "Clue" }, { subtype: "Food" }] } },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
