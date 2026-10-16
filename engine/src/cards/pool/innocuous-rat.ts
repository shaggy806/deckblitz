import { defineCard } from "../define.js";

// EDHREC rank 11895.
const TEXT =
  "When this creature dies, manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Innocuous Rat",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "manifest-dread" },
      resolve: null,
      text: TEXT,
    },
  ],
});
