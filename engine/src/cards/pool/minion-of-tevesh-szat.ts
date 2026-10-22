import { defineCard } from "../define.js";

// Ice Age. Force of Nature's upkeep punisher.

const UPKEEP_TEXT = "At the beginning of your upkeep, this creature deals 2 damage to you unless you pay {B}{B}.";

export default defineCard({
  name: "Minion of Tevesh Szat",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Minion"],
  power: 4,
  toughness: 4,
  text: `${UPKEEP_TEXT}\n{T}: Target creature gets +3/-2 until end of turn.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature gets +3/-2 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{B}{B}", text: "Pay {B}{B}" }],
        otherwise: { kind: "damage", amount: 2, who: "you" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
