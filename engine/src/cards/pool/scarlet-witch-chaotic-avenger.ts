import { defineCard } from "../define.js";

// EDHREC rank 11568. Marvel Super Heroes Commander.
//
// "Cards exiled with Scarlet Witch" is every card this object has exiled
// this way, the earlier triggers' included (rule 607.2a — the exile is
// linked to the source's battlefield stint, `exiled-with-source`): the two
// just exiled go face down beside them, then one Hero or noncreature spell
// may be cast from among all of them for free. A land is never offered.

const TEXT =
  "Whenever Scarlet Witch deals combat damage to a player, look at the top two cards of your library, then exile them face down. Then you may cast a Hero or noncreature spell from among cards exiled with Scarlet Witch without paying its mana cost.";

export default defineCard({
  name: "Scarlet Witch, Chaotic Avenger",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Warlock", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 2,
            min: 2,
            max: 2,
            destination: "exile-face-down",
            leftover: "stay",
          },
          {
            kind: "cast-now",
            from: "exiled-with-source",
            free: true,
            spell: { anyOf: [{ subtype: "Hero" }, { notTypes: ["creature"] }] },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
