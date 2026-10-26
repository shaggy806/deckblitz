import { defineCard } from "../define.js";

// EDHREC rank 17635.

export default defineCard({
  name: "Kuro, Pitlord",
  manaCost: "{6}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 9,
  toughness: 9,
  text: "At the beginning of your upkeep, sacrifice Kuro unless you pay {B}{B}{B}{B}.\nPay 1 life: Target creature gets -1/-1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 1 },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "Pay 1 life: Target creature gets -1/-1 until end of turn.",
    },
  ],
  triggered: [
    {
      // Arcades Sabboth's upkeep cost.
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{B}{B}{B}{B}", text: "Pay {B}{B}{B}{B}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice Kuro unless you pay {B}{B}{B}{B}.",
    },
  ],
});
