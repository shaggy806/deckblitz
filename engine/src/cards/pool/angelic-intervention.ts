import { defineCard } from "../define.js";

// EDHREC rank 10181. "If it's a creature" is read as it resolves, after the
// protection.

export default defineCard({
  name: "Angelic Intervention",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature or planeswalker you control gains protection from colorless or from the color of your choice until end of turn. If it's a creature, put a +1/+1 counter on it. (It can't be blocked, targeted, dealt damage, enchanted, or equipped by anything with that quality.)",
  targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color", or: [{ text: "colorless", from: { filter: { colorless: true } } }] },
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature" } },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
    ],
  },
});
