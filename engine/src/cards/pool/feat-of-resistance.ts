import { defineCard } from "../define.js";

// EDHREC rank 10478.
//
// Rulings:
//   [2014-09-20] You choose the color as Feat of Resistance resolves.
export default defineCard({
  name: "Feat of Resistance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature you control. It gains protection from the color of your choice until end of turn. (It can't be blocked, targeted, dealt damage, enchanted, or equipped by anything of that color.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
    ],
  },
});
