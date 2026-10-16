import { defineCard } from "../define.js";

// EDHREC rank 11675.
//
// Stingcaster Mage's trigger.

const ETB_TEXT =
  "When this creature enters, target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost.";

export default defineCard({
  name: "Slickshot Lockpicker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  plot: { cost: "{2}{U}" },
  text: `${ETB_TEXT} (You may cast that card from your graveyard for its flashback cost. Then exile it.)\nPlot {2}{U} (You may pay {2}{U} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["instant-or-sorcery-in-your-graveyard"],
      effect: { kind: "grant-flashback", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
