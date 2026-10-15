import { defineCard } from "../define.js";

// EDHREC rank 16795. Infusion is read as the spell resolves.

export default defineCard({
  name: "Efflorescence",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put two +1/+1 counters on target creature.\nInfusion — If you gained life this turn, that creature also gains trample and indestructible until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
