import { defineCard } from "../define.js";

// "Another target Goblin you control": any Goblin permanent of yours but
// this one. The granted "when this creature deals combat damage" names no
// recipient, so it fires once per combat damage event (rule 603.2c).
const LORD_TEXT = "Other Goblins you control get +1/+1.";
const GRANTED_TEXT = "When this creature deals combat damage, sacrifice it.";
const BOMB_TEXT = `{R}: Until end of turn, another target Goblin you control gains flying and "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Dropkick Bomber",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 3,
  text: `${LORD_TEXT}\n${BOMB_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Goblin" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { subtype: "Goblin", controlledBy: "you" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          {
            kind: "grant-triggered",
            target: 0,
            duration: "end-of-turn",
            ability: {
              trigger: { on: "deals-damage", who: "self", combat: true },
              targets: [],
              effect: { kind: "sacrifice-source" },
              resolve: null,
              text: GRANTED_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: BOMB_TEXT,
    },
  ],
});
