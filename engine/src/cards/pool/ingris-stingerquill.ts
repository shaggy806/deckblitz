import { defineCard } from "../define.js";

// EDHREC rank 13637.
//
// "That creature deals 1 damage": the attacker is the damage's source
// (`from: "trigger-object"`), so its lifelink, deathtouch and colours apply.

const ATTACK_TEXT = "Whenever a creature you control attacks, that creature deals 1 damage to each opponent.";
const CADET_TEXT =
  "{4}: Create a 2/2 colorless Wizard Soldier creature token named Cadet. Then creatures you control gain haste until end of turn.";

export default defineCard({
  name: "Ingris Stingerquill",
  manaCost: "{B}{R}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Sphinx"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${CADET_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent", from: "trigger-object" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Cadet", count: 1 },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: CADET_TEXT,
    },
  ],
});
