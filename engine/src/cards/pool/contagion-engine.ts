import { defineCard } from "../define.js";

// EDHREC rank 1852. Scars of Mirrodin.
//
// The enters trigger counts the target player's creatures as it resolves
// (`controlledByTarget`, Requisition Raid's shape). Proliferating twice is two
// whole proliferate actions, each with its own choice, with no chance to
// respond between them (the 2011 rulings), so a sequence of two.
const ENTERS_TEXT = "When this artifact enters, put a -1/-1 counter on each creature target player controls.";
const ACTIVATED_TEXT = "{4}, {T}: Proliferate twice.";

export default defineCard({
  name: "Contagion Engine",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS_TEXT}\n${ACTIVATED_TEXT} (Choose any number of permanents and/or players, then give each another counter of each kind already there. Then do it again.)`,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "sequence", effects: [{ kind: "proliferate" }, { kind: "proliferate" }] },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "-1/-1",
        amount: 1,
        controlledByTarget: 0,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
