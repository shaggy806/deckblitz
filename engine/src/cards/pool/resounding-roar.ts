import { defineCard } from "../define.js";

const CYCLE_TEXT = "When you cycle this card, target creature gets +6/+6 until end of turn.";

export default defineCard({
  name: "Resounding Roar",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{5}{R}{G}{W}" },
  text: `Target creature gets +3/+3 until end of turn.\nCycling {5}{R}{G}{W} ({5}{R}{G}{W}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 6, toughness: 6, duration: "end-of-turn" },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
