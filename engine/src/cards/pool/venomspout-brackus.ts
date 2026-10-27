import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 28703. Aven Archer's shot at 5, fliers only, with morph.

const TEXT = "{1}{G}, {T}: This creature deals 5 damage to target attacking or blocking creature with flying.";

export default defineCard({
  name: "Venomspout Brackus",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
  morph: { keyword: "morph", cost: "{3}{G}{G}" },
  text: `${TEXT}\nMorph {3}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", keyword: "flying", anyOf: [{ attacking: true }, { blocking: true }] },
        },
      ],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
