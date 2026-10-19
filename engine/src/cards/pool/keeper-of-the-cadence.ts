import { defineCard } from "../define.js";

// EDHREC rank 28159. Reito Sentinel's graveyard hate, narrowed to three card
// types.
const TEXT = "{3}: Put target artifact, instant, or sorcery card from a graveyard on the bottom of its owner's library.";

export default defineCard({
  name: "Keeper of the Cadence",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "any",
          filter: { typesAnyOf: ["artifact", "instant", "sorcery"] },
        },
      ],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: TEXT,
    },
  ],
});
