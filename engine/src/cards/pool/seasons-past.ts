import { defineCard } from "../define.js";

// Not targeted: the cards are chosen as it resolves (the ruling), no two with the same mana value —
// compared with one another, not with Seasons Past; an {X} counts 0 and a card with no mana cost
// (a land) has mana value 0 (the rulings; rule 202.3a, 202.3e).

export default defineCard({
  name: "Seasons Past",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return any number of cards with different mana values from your graveyard to your hand. Put Seasons Past on the bottom of its owner's library.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 99,
        together: { distinctManaValues: true },
        destination: "hand",
        leftover: "stay",
      },
      { kind: "put-on-library", target: "source", position: "bottom" },
    ],
  },
});
