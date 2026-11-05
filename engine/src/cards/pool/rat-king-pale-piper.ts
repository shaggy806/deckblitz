import { defineCard } from "../define.js";

// EDHREC rank 9339.
// Makes Rat → use "Rat Token".

export default defineCard({
  name: "Rat King, Pale Piper",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rat", "Avatar"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace\nWhenever Rat King or another nontoken creature you control leaves the battlefield, create a 1/1 black Rat creature token.\n{2}, Sacrifice a token: Draw a card.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { token: true } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, Sacrifice a token: Draw a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Rat Token", count: 1 },
      resolve: null,
      text: "Whenever Rat King or another nontoken creature you control leaves the battlefield, create a 1/1 black Rat creature token.",
    },
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Rat Token", count: 1 },
      resolve: null,
      text: "Whenever Rat King or another nontoken creature you control leaves the battlefield, create a 1/1 black Rat creature token.",
    },
  ],
});
