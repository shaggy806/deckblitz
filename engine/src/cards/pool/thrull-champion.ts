import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 29531.
//
// Rulings:
//   - Can be used to steal another Thrull Champion.
//   - It untaps as normal; whether it's tapped or untapped has no bearing on the control change.
//   - Gives himself +1/+1.
const ANTHEM = "Thrull creatures get +1/+1.";
const STEAL = "{T}: Gain control of target Thrull for as long as you control this creature.";

export default defineCard({
  name: "Thrull Champion",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM}\n${STEAL}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Thrull" } },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Thrull" } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: STEAL,
    },
  ],
});
