import { defineCard } from "../define.js";

// EDHREC rank 6898.
// Makes Rat → use "Rat Token".

export default defineCard({
  name: "Big Apple, 3 a.m.",
  colors: [],
  types: ["land"],
  text: "This land enters tapped. As it enters, choose a color.\n{T}: Add one mana of the chosen color.\n{5}, {T}: Create a 1/1 black Rat creature token for each opponent you have.",
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of the chosen color.",
    },
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Rat Token", count: { countPlayers: "each-opponent" } },
      resolve: null,
      text: "{5}, {T}: Create a 1/1 black Rat creature token for each opponent you have.",
    },
  ],
});
