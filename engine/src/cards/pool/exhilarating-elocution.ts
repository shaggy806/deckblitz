import { defineCard } from "../define.js";

export default defineCard({
  name: "Exhilarating Elocution",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Put two +1/+1 counters on target creature you control. Other creatures you control get +1/+1 until end of turn.",
  targets: [{ kind: "permanent", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "you" },
        exceptTarget: 0,
        as: 1,
        simultaneous: true,
        effect: { kind: "modify-pt", target: 1, power: 1, toughness: 1, duration: "end-of-turn" },
      },
    ],
  },
});
