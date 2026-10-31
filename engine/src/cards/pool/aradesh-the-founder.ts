import { defineCard } from "../define.js";
import { enlist, ENLIST_TEXT } from "../helpers.js";

// "If it enlisted a creature this combat" (rule 702.154c) is an intervening
// "if" (603.4) about the attacker: enlist is paid as the attack is declared,
// before the attack triggers, so it's true as this triggers — and asked of
// the attacker as it last existed if it has left by the time this resolves.
const ATTACK_TEXT =
  "Whenever a creature you control attacks, if it enlisted a creature this combat, the creature that attacked gains double strike until end of turn. If that creature's power is 4 or greater, draw a card.";

export default defineCard({
  name: "Aradesh, the Founder",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 4,
  text: `${ENLIST_TEXT}\n${ATTACK_TEXT}`,
  static: [enlist()],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      condition: { kind: "trigger-object", filter: { enlistedThisCombat: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "trigger-object", keyword: "double-strike", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { power: { op: "gte", n: 4 } } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
