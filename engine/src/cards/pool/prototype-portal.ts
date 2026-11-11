import { defineCard } from "../define.js";

// Scars of Mirrodin (SOM). EDHREC rank 9070.
//
// The {X} in its cost isn't chosen: the ability defines it (rule 107.3c) as
// the exiled card's mana value, an {X} in that card's own cost counting 0
// (rule 202.3e). With no card exiled X is undefined and the ability can't be
// activated (its ruling).
const IMPRINT = "Imprint — When this artifact enters, you may exile an artifact card from your hand.";
const COPY = "{X}, {T}: Create a token that's a copy of the exiled card. X is the mana value of that card.";

export default defineCard({
  name: "Prototype Portal",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${IMPRINT}\n${COPY}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "exile",
        leftover: "stay",
        filter: { type: "artifact" },
      },
      resolve: null,
      text: IMPRINT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      xIs: { manaValueOf: "exiled-with-source" },
      targets: [],
      effect: { kind: "create-token-copy", of: "exiled-with-source", count: 1 },
      resolve: null,
      text: COPY,
    },
  ],
});
