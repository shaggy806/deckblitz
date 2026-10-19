import { defineCard } from "../define.js";

// EDHREC rank 15028.
//
// One `attack-with` trigger per attack declaration, counting the declared Soldiers; the
// creatures it pumps are fixed as it resolves (rule 611.2c), attacking or not.

const ATTACK_TEXT =
  "Whenever you attack with five or more Soldiers, creatures you control get +1/+1 and gain flying until end of turn.";
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Harbin, Vanguard Aviator",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 5, filter: { subtype: "Soldier" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
