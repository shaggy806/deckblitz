import { defineCard } from "../define.js";

// EDHREC rank 24673.

export default defineCard({
  name: "Enshrouding Mist",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +1/+1 until end of turn. Prevent all damage that would be dealt to it this turn. If it's renowned, untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "prevent-damage", target: 0, amount: "all" },
      { kind: "conditional", condition: { kind: "target", index: 0, filter: { renowned: true } }, then: { kind: "untap", target: 0 } },
    ],
  },
});
