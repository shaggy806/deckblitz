import { defineCard } from "../define.js";

const BATTLE_CRY_TEXT =
  "Battle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)";
const COMBAT_TEXT =
  'At the beginning of combat on your turn, the next time target creature would deal combat damage to one or more players this combat, prevent that damage. If damage is prevented this way, create that many 1/1 colorless Phyrexian Mite artifact creature tokens with toxic 1 and "This token can\'t block."';

// EDHREC rank 10180. The shield's "x" is the damage it prevented (rule 615.5).
export default defineCard({
  name: "Ria Ivor, Bane of Bladehold",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Knight"],
  power: 3,
  toughness: 4,
  text: `${BATTLE_CRY_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt-all", filter: { type: "creature", attacking: true }, power: 1, toughness: 0, duration: "end-of-turn", exceptSource: true },
      resolve: null,
      text: BATTLE_CRY_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "replacement-effect",
        replacement: {
          event: "would-deal-damage",
          combat: true,
          to: "player",
          instead: { prevent: true, then: { kind: "create-token", token: "Phyrexian Mite Token", count: "x" } },
        },
        duration: "until-end-of-combat",
        next: true,
        fromObject: 0,
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
