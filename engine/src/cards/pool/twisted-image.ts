import { defineCard } from "../define.js";

// Rule 613.4d: the switch applies after every other P/T effect and counter,
// so a +1/+1 counter or a pump after it still adds to the creature's power
// before the switch moves it to toughness.

export default defineCard({
  name: "Twisted Image",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Switch target creature's power and toughness until end of turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "switch-pt", target: 0, duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});
