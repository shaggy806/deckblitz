import { defineCard } from "../define.js";

// EDHREC rank 26898.
//
// Torrential Gearhulk's shape. An artifact cast this way resolves onto the
// battlefield; the exile replacement only ever applies to the spell's move
// off the stack (countered, or an instant/sorcery resolving).

export default defineCard({
  name: "Victor Timely, Wily Tycoon",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Villain"],
  power: 3,
  toughness: 4,
  text: "When Victor Timely enters, you may cast target artifact, instant, or sorcery card with mana value 4 or less from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["artifact", "instant", "sorcery"], manaValue: { op: "lte", n: 4 } },
        },
      ],
      effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
      resolve: null,
      text: "When Victor Timely enters, you may cast target artifact, instant, or sorcery card with mana value 4 or less from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.",
    },
  ],
});
