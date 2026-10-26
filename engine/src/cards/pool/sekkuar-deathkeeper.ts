import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 16622.

export default defineCard({
  name: "Sek'Kuar, Deathkeeper",
  manaCost: "{2}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Shaman"],
  power: 4,
  toughness: 3,
  text: "Whenever another nontoken creature you control dies, create a 3/1 black and red Graveborn creature token with haste.",
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Graveborn Token", count: 1 },
      resolve: null,
      text: "Whenever another nontoken creature you control dies, create a 3/1 black and red Graveborn creature token with haste.",
    },
  ],
});
