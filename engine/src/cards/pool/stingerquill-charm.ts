import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 21678.
//
// The Cadet is Ingris Stingerquill's named token; "it gains haste until end of
// turn" is part of making it (`gainUntilEndOfTurn`), so only the token just
// made gets it.

const DAMAGE_MODE = "Stingerquill Charm deals 3 damage to any target.";
const GRANT_MODE = "Target creature gains first strike and deathtouch until end of turn.";
const CADET_MODE =
  "Create a 2/2 colorless Wizard Soldier creature token named Cadet. It gains haste until end of turn.";

export default defineCard({
  name: "Stingerquill Charm",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: `Choose one —\n• ${DAMAGE_MODE}\n• ${GRANT_MODE}\n• ${CADET_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DAMAGE_MODE,
        targets: ["any-target"],
        effect: { kind: "damage", amount: 3, target: 0 },
      },
      {
        text: GRANT_MODE,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: CADET_MODE,
        targets: [],
        effect: { kind: "create-token", token: "Cadet", count: 1, gainUntilEndOfTurn: ["haste"] },
      },
    ],
  },
});
