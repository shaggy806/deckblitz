import { defineCard } from "../define.js";

// EDHREC rank 13350.

export default defineCard({
  name: "Zuko, Avatar Hunter",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 4,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nWhenever you cast a red spell, create a 2/2 red Soldier creature token.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token (Red 2/2)", count: 1 },
      resolve: null,
      text: "Whenever you cast a red spell, create a 2/2 red Soldier creature token.",
    },
  ],
});
