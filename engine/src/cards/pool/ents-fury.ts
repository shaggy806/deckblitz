import { defineCard } from "../define.js";

// EDHREC rank 12075.
//
// An illegal target's slot is blank as the spell resolves (rule 608.2b), so
// the "target" condition reads false for it and `fight` needs both slots;
// the power is read as the spell resolves.
export default defineCard({
  name: "Ent's Fury",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature you control if its power is 4 or greater. Then that creature gets +1/+1 until end of turn and fights target creature you don't control.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { power: { op: "gte", n: 4 } } },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
