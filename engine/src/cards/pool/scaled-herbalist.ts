import { defineCard } from "../define.js";

// EDHREC rank 8503. Llanowar Scout's ability: not a land play, so it doesn't
// use one up and works on any turn the ability can be activated.

const TEXT = "{T}: You may put a land card from your hand onto the battlefield.";

export default defineCard({
  name: "Scaled Herbalist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard", "Druid"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "land" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
