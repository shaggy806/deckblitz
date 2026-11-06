import { defineCard } from "../define.js";

// EDHREC rank 32035.

export default defineCard({
  name: "Armus, Skin of Evil",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ooze", "Horror"],
  power: 6,
  toughness: 6,
  keywords: ["menace"],
  text: "Menace\nAt the beginning of your end step, target opponent discards two cards.\n{2}{B}, Discard this card: Target creature gets -4/-4 until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{B}, Discard this card: Target creature gets -4/-4 until end of turn.",
      zone: "hand",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: 2 },
      resolve: null,
      text: "At the beginning of your end step, target opponent discards two cards.",
    },
  ],
});
