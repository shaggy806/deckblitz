import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 5340. Only the creatures you control as it resolves.
const TEXT =
  "Whenever Beregond or another Human you control enters, creatures you control get +1/+1 and gain vigilance until end of turn.";

export default defineCard({
  name: "Beregond of the Guard",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Human" } },
    targets: [],
    effect: {
      kind: "sequence",
      effects: [
        {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 1,
          duration: "end-of-turn",
        },
        {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "vigilance",
          duration: "end-of-turn",
        },
      ],
    },
    resolve: null,
    text: TEXT,
  }),
});
