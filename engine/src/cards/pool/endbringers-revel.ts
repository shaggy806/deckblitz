import { defineCard } from "../define.js";

// EDHREC rank 24063. "Any player may activate this ability but only as a
// sorcery": `anyPlayer` with `sorcerySpeed` — the activator's own main phase.

const TEXT =
  "{4}: Return target creature card from a graveyard to its owner's hand. Any player may activate this ability but only as a sorcery.";

export default defineCard({
  name: "Endbringer's Revel",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      anyPlayer: true,
      sorcerySpeed: true,
      text: TEXT,
    },
  ],
});
