import { defineCard } from "../define.js";

// EDHREC rank 31761.
//
// "Blocking this creature" is `blockingRelation` (Knight of Dusk).
const TEXT = "{B}: Target green creature blocking this creature gets -1/-1 until end of turn.";

export default defineCard({
  name: "Barbed-Back Wurm",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [
        { kind: "permanent", filter: { type: "creature", colors: ["G"], blockingRelation: { relation: "blocking" } } },
      ],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
