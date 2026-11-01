import { defineCard } from "../define.js";

// EDHREC rank 7982.
const GAINS_TEXT =
  "{T}: Target creature card in your graveyard gains embalm until end of turn. The embalm cost is equal to its mana cost. (Exile that card and pay its embalm cost: Create a token that's a copy of it, except it's a white Zombie in addition to its other types and has no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Cursecloth Wrappings",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: `Zombies you control get +1/+1.\n${GAINS_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Zombie", controlledBy: "you" } },
      grantPt: [1, 1],
      text: "Zombies you control get +1/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "grant-graveyard-keyword", target: 0, grant: { keyword: "embalm" } },
      resolve: null,
      text: GAINS_TEXT,
    },
  ],
});
