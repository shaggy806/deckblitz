import { defineCard } from "../define.js";

// EDHREC rank 13838. Territory Culler's look, for a snow card, with an {S}
// (rule 107.4h) in the cost. A card that isn't put into the hand stays on top.
const TEXT =
  "{S}, {T}: Look at the top card of your library. If it's a snow card, you may reveal it and put it into your hand.";

export default defineCard({
  name: "Frost Augur",
  manaCost: "{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: `${TEXT} ({S} can be paid with one mana from a snow source.)`,
  activated: [
    {
      cost: { mana: "{S}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { supertype: "snow" },
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
