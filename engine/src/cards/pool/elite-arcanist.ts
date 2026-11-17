import { defineCard } from "../define.js";

// Magic 2014 (M14). EDHREC rank 17625.
//
// The two abilities are linked (rule 607.2a): "the exiled card" is the one
// its own enters ability exiled. The {X} in the cost isn't chosen: the
// ability defines it (rule 107.3c) as that card's mana value — a split
// card's both halves together (rule 709.4, its ruling) — and with no card
// exiled it can't be activated. The copy is created in exile and cast from
// there for free, X in its own cost 0, its additional costs paid (its
// rulings); a copy not cast ceases to exist (rule 704.5e).
const EXILE = "When this creature enters, you may exile an instant card from your hand.";
const COPY =
  "{X}, {T}: Copy the exiled card. You may cast the copy without paying its mana cost. X is the mana value of the exiled card.";

export default defineCard({
  name: "Elite Arcanist",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${EXILE}\n${COPY}`,
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
        filter: { type: "instant" },
      },
      resolve: null,
      text: EXILE,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      xIs: { manaValueOf: "exiled-with-source" },
      targets: [],
      effect: { kind: "cast-now", from: "exiled-with-source", copies: 1, free: true },
      resolve: null,
      text: COPY,
    },
  ],
});
