import { defineCard } from "../define.js";

// Rulings:
//   You choose the modes as you cast the spell. Once modes are chosen, they can't be changed.
//   No matter which combination of modes you choose, you always follow the instructions in the
//     order they are written.
//   No player can cast spells or activate abilities in between the modes of a resolving spell.
//   If an effect copies Doomsday Confluence, the copy will have the same modes chosen the same
//     number of times.
//
// "Choose X" is `modesX`: the modes chosen as it's cast are X of them, X its own (rule 601.2b) —
// the cast's X is the number of modes. Cast without paying its mana cost, X is 0: no modes.

const MODE_SACRIFICE = "Each player sacrifices a nonartifact creature of their choice.";
const MODE_DALEK = "Create a 3/3 black Dalek artifact creature token with menace.";
const MODE_DISCARD = "Each opponent discards a card.";

export default defineCard({
  name: "Doomsday Confluence",
  manaCost: "{X}{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Choose X. You may choose the same mode more than once.\n• ${MODE_SACRIFICE}\n• ${MODE_DALEK}\n• ${MODE_DISCARD}`,
  castModal: {
    minModes: 0,
    maxModes: 0,
    modesX: true,
    repeatModes: true,
    modes: [
      {
        text: MODE_SACRIFICE,
        effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature", notTypes: ["artifact"] }, count: 1 },
      },
      { text: MODE_DALEK, effect: { kind: "create-token", token: "Dalek Token", count: 1 } },
      { text: MODE_DISCARD, effect: { kind: "discard", target: "each-opponent", amount: 1 } },
    ],
  },
});
