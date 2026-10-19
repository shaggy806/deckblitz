import { defineCard } from "../define.js";

// Tobias itself is one of the nontoken creatures you controlled that died
// this turn, so it always makes at least one Zombie. Counted as the ability
// resolves, from the creatures that died under your control (as they last
// were — a token stays a token).
export default defineCard({
  name: "Tobias, Doomed Conqueror",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: "Flash\nWhen Tobias dies, for each nontoken creature you controlled that died this turn, create a 2/2 black Zombie creature token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Zombie Token",
        count: { turnHistory: "died", filter: { token: false } },
      },
      resolve: null,
      text: "When Tobias dies, for each nontoken creature you controlled that died this turn, create a 2/2 black Zombie creature token.",
    },
  ],
});
