import { defineCard } from "../define.js";

// The card is exiled linked to the Book (each Book tracks its own — its
// ruling). The copies are cast while the ability resolves; one not cast ceases
// to exist. 1–9 pays the copy's costs; 10–19 pays {1} instead of its mana cost;
// 20 casts any number of copies of every card exiled with it for free.
const TEXT =
  "{T}: Exile target instant or sorcery card from a graveyard. Roll a d20. Activate only as a sorcery.\n1—9 | Copy that card. You may cast the copy.\n10—19 | Copy that card. You may cast the copy by paying {1} rather than paying its mana cost.\n20 | Copy each card exiled with this artifact. You may cast any number of the copies without paying their mana costs.";

export default defineCard({
  name: "Wizard's Spellbook",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, linked: true },
          {
            kind: "roll-dice",
            sides: 20,
            table: [
              { min: 1, max: 9, effect: { kind: "cast-now", from: "exiled-this-way", copies: 1 } },
              { min: 10, max: 19, effect: { kind: "cast-now", from: "exiled-this-way", copies: 1, byPaying: "{1}" } },
              { min: 20, max: 20, effect: { kind: "cast-now", from: "exiled-with-source", copies: 1, repeat: true, free: true } },
            ],
          },
        ],
      },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
