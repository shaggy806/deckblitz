import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 12575.
//
// The {X} in its cost isn't chosen: the ability defines it (rule 107.3c) as
// the exiled card's mana value, an {X} in that card's own cost counting 0
// (rule 202.3e). With no card exiled, X is undefined and the ability can't
// be activated. The token is put onto the battlefield, not cast, so no
// optional cost of the card is paid; it has the card's mana cost (rule
// 707.2, the rulings).
const IMPRINT = "Imprint — When this artifact enters, you may exile a creature card from your hand.";
const COPY = "{X}, {T}: Create a token that's a copy of the exiled card. X is the mana value of that card.";

export default defineCard({
  name: "Soul Foundry",
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
        filter: { type: "creature" },
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
