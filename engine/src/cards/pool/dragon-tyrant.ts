import { defineCard } from "../define.js";

// EDHREC rank 20925.

export default defineCard({
  name: "Dragon Tyrant",
  manaCost: "{8}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample", "double-strike"],
  text: "Flying, trample\nDouble strike (This creature deals both first-strike and regular combat damage.)\nAt the beginning of your upkeep, sacrifice this creature unless you pay {R}{R}{R}{R}.\n{R}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{R}{R}{R}{R}", text: "Pay {R}{R}{R}{R}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice this creature unless you pay {R}{R}{R}{R}.",
    },
  ],
});
