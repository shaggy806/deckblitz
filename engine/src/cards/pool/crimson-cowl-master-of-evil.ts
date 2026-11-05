import { defineCard } from "../define.js";

// EDHREC rank 16411.
// Makes Villain → use "Villain Token".

export default defineCard({
  name: "Crimson Cowl, Master of Evil",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 1,
  toughness: 3,
  text: "Whenever one or more nontoken Villains you control attack a player, you create a 2/1 black Villain creature token with menace. (It can't be blocked except by two or more creatures.)",
  triggered: [
    {
      trigger: {
        on: "attacks-player",
        who: "you",
        defender: "any",
        filter: { token: false, subtype: "Villain" },
      },
      targets: [],
      effect: { kind: "create-token", token: "Villain Token", count: 1 },
      resolve: null,
      text: "Whenever one or more nontoken Villains you control attack a player, you create a 2/1 black Villain creature token with menace.",
    },
  ],
});
