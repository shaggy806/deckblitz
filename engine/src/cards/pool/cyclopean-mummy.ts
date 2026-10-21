import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 31745.
// Rulings:
//   The Mummy does go to the graveyard and trigger abilities which watch for something going to
//   the graveyard. It then gets exiled as a triggered ability.
//   It does not get exiled if it goes to the graveyard from someplace other than the
//   battlefield.
// A dies trigger, so only from the battlefield; "exile it" is the card the
// trigger is about, in the graveyard.

const TEXT = "When this creature dies, exile it.";

export default defineCard({
  name: "Cyclopean Mummy",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "exile", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
