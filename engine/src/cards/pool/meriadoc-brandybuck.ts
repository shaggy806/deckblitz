import { defineCard } from "../define.js";

// EDHREC rank 6096.
// Makes Food → use "Food Token".

export default defineCard({
  name: "Meriadoc Brandybuck",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Citizen"],
  power: 2,
  toughness: 2,
  text: "Whenever one or more Halflings you control attack a player, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  triggered: [
    {
      trigger: { on: "attacks-player", who: "you", defender: "any", filter: { subtype: "Halfling" } },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "Whenever one or more Halflings you control attack a player, create a Food token.",
    },
  ],
});
