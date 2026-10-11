import { defineCard } from "../define.js";

// EDHREC rank 2313.
//
// Rulings: the spell that triggered it is still on the stack, so it isn't
// among the cards that can be exiled; the copies are cast as the ability
// resolves, in the order you choose, never later; X is 0; the exiled cards
// stay exiled if it leaves, and a new Arcane Bombardment (or this one back
// again) doesn't get them. The exile is `linked` to this stint
// (`exiled-with-source`), and every card exiled with it is copied each time,
// each copy its own "may" (`repeat`).

const TEXT =
  "Whenever you cast your first instant or sorcery spell each turn, exile an instant or sorcery card at random from your graveyard. Then copy each card exiled with this enchantment. You may cast any number of the copies without paying their mana costs.";

export default defineCard({
  name: "Arcane Bombardment",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true, filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-random-card",
            zone: "graveyard",
            filter: { typesAnyOf: ["instant", "sorcery"] },
            then: { kind: "exile", target: 0, linked: true },
          },
          { kind: "cast-now", from: "exiled-with-source", copies: 1, free: true, repeat: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
