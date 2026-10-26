import { defineCard } from "../define.js";

// EDHREC rank 22009. Only Puresight Merrow's controller looks; the card is
// exiled face up with no link to anything (no "the exiled card" refers to it),
// or stays on top.
const TEXT = "{W/U}, {Q}: Look at the top card of your library. You may exile that card.";

export default defineCard({
  name: "Puresight Merrow",
  manaCost: "{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${TEXT} ({Q} is the untap symbol.)`,
  activated: [
    {
      cost: { mana: "{W/U}", tap: false, untap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        destination: "exile",
        unlinked: true,
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
