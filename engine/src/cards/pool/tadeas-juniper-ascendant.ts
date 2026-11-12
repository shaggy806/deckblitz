import { defineCard } from "../define.js";

// EDHREC rank 12838. "It can't be blocked by creatures with greater power this
// combat" is a static granted to the attacker until end of combat, so "greater
// power" is read against its power as blockers are declared (Ant-Man's shape).

const ATTACK_TEXT =
  "Whenever a creature you control with reach attacks, untap it and it can't be blocked by creatures with greater power this combat.";

export default defineCard({
  name: "Tadeas, Juniper Ascendant",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\nTadeas has hexproof unless it's attacking.\n${ATTACK_TEXT}\nWhenever one or more creatures you control deal combat damage to a player, draw a card.`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: false } },
      grantKeywords: ["hexproof"],
      text: "Tadeas has hexproof unless it's attacking.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", keyword: "reach" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "trigger-object" },
          {
            kind: "grant-static",
            target: "trigger-object",
            duration: "until-end-of-combat",
            ability: {
              affects: { scope: "self" },
              restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "gt", n: { amount: { powerOf: "source" } } } } }],
              text: "This creature can't be blocked by creatures with greater power this combat.",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever one or more creatures you control deal combat damage to a player, draw a card.",
    },
  ],
});
