import { defineCard } from "../define.js";

// EDHREC rank 9554.
// Makes Halfling → use "Halfling Token".
//
// Rulings:
//   [2023-06-16] If Saradoc, Master of Buckland's power is greater than 2 as it enters the
//     battlefield, its first ability will still trigger.

const ENTERS_TEXT =
  "Whenever Saradoc or another nontoken creature you control with power 2 or less enters, create a 1/1 white Halfling creature token.";
const TAP_TEXT = "Tap two other untapped Halflings you control: Saradoc gets +2/+0 and gains lifelink until end of turn.";
const HALFLING = { kind: "create-token", token: "Halfling Token", count: 1 } as const;

// One ability, two events: Saradoc itself entering (whatever its power — the
// ruling) and another nontoken creature with power 2 or less.
export default defineCard({
  name: "Saradoc, Master of Buckland",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Citizen"],
  power: 2,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: HALFLING,
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        otherOnly: true,
        filter: { type: "creature", token: false, power: { op: "lte", n: 2 } },
      },
      sameAbilityAs: 0,
      targets: [],
      effect: HALFLING,
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 2, filter: { subtype: "Halfling" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
