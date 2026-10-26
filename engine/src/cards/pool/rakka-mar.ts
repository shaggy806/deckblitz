import { defineCard } from "../define.js";

// EDHREC rank 18341.

export default defineCard({
  name: "Rakka Mar",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\n{R}, {T}: Create a 3/1 red Elemental creature token with haste.",
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "3/1 Red Elemental Token (Haste)", count: 1 },
      resolve: null,
      text: "{R}, {T}: Create a 3/1 red Elemental creature token with haste.",
    },
  ],
});
