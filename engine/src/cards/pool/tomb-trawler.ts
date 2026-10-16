import { defineCard } from "../define.js";

// EDHREC rank 10953. Barkform Harvester's ability.
const PUT_TEXT = "{2}: Put target card from your graveyard on the bottom of your library.";

export default defineCard({
  name: "Tomb Trawler",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 4,
  text: PUT_TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: {} }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: PUT_TEXT,
    },
  ],
});
