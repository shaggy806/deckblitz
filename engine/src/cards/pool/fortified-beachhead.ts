import { defineCard } from "../define.js";

// EDHREC rank 12661.
//
// Temple of the Dragon Queen's reveal-or-control replacement, for Soldiers.

const REVEAL_TEXT =
  "As this land enters, you may reveal a Soldier card from your hand. This land enters tapped unless you revealed a Soldier card this way or you control a Soldier.";
const PUMP_TEXT = "{5}, {T}: Soldiers you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Fortified Beachhead",
  colors: [],
  types: ["land"],
  text: `${REVEAL_TEXT}\n{T}: Add {W} or {U}.\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnlessRevealFromHand: ["Soldier"],
        tappedUnless: { kind: "controls", filter: { subtype: "Soldier" }, atLeast: 1 },
        revealOrCondition: true,
      },
      text: REVEAL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {W} or {U}.",
    },
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { subtype: "Soldier", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
