import { defineCard } from "../define.js";

// EDHREC rank 9895. The card may also stay on top (the ruling): both picks
// are optional.
const SCRY_TEXT = "If you would scry a number of cards, scry that many cards plus one instead.";
const LOOK_TEXT =
  "{3}{G/U}: Look at the top card of your library. If it's a Kraken, Leviathan, Octopus, or Serpent creature card, you may put it onto the battlefield. If you don't put the card onto the battlefield, you may put it on the bottom of your library.";

export default defineCard({
  name: "Kenessos, Priest of Thassa",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Cleric"],
  power: 1,
  toughness: 3,
  text: `${SCRY_TEXT}\n${LOOK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-scry", who: "you", instead: { modify: { plus: 1 } } },
      text: SCRY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G/U}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: { type: "creature", subtypes: ["Kraken", "Leviathan", "Octopus", "Serpent"] },
        destination: "battlefield",
        secondPick: { min: 0, max: 1, destination: "library-bottom" },
        leftover: "stay",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
