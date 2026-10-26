import { defineCard } from "../define.js";

// The creatures attacking as it resolves get the bonus, for the rest of the
// turn (the rulings; rule 611.2c).
export default defineCard({
  name: "Rally the Forces",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Attacking creatures get +1/+0 and gain first strike until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", attacking: true },
        keyword: "first-strike",
        duration: "end-of-turn",
      },
    ],
  },
});
