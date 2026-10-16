import { defineCard } from "../define.js";

// EDHREC rank 7387.
//
// Glasspool Mimic's ability: "Shapeshifter Rogue in addition" is copiable, so
// a copy of the Bandit is one too. Choosing nothing, it's a 2/2.

const COPY_TEXT =
  "You may have this creature enter as a copy of a creature you control, except it's a Shapeshifter Rogue in addition to its other types.";

export default defineCard({
  name: "Visage Bandit",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Rogue"],
  power: 2,
  toughness: 2,
  plot: { cost: "{2}{U}" },
  text: `${COPY_TEXT}\nPlot {2}{U} (You may pay {2}{U} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  copyOnEnter: {
    filter: { type: "creature", controlledBy: "you" },
    except: { addSubtypes: ["Shapeshifter", "Rogue"] },
  },
});
