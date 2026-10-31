import { defineCard } from "../define.js";

// Phyrexia: All Will Be One (ONE). EDHREC rank 14058.
//
// Rulings:
//   - You can't choose more targets than the greatest power among creatures you control as you
//     activate the ability, and each chosen target must receive at least 1 damage.
//   - For Lukka's last ability, you announce the targets and how damage is divided as you activate
//     the ability. Once the ability has been activated, the greatest power among creatures you
//     control no longer matters for this ability.
//   - If some of the targets of the last ability become illegal, the original division of damage
//     still applies, but the damage that would have been dealt to illegal targets isn't dealt.
//
// The −4's X is read as it's activated (rules 602.2b, 601.2d), which caps
// the targets at X; the +1 is a loyalty ability, so not a mana ability
// (605.1a) — it uses the stack.

const PLUS_TEXT =
  "+1: Add {R}{G}. Spend this mana only to cast creature spells or activate abilities of creatures.";
const MINUS_ONE_TEXT = "−1: Create a 3/3 green Phyrexian Beast creature token with toxic 1.";
const MINUS_FOUR_TEXT =
  "−4: Lukka deals X damage divided as you choose among any number of target creatures and/or planeswalkers, where X is the greatest power among creatures you control as you activate this ability.";

export default defineCard({
  name: "Lukka, Bound to Ruin",
  manaCost: "{2}{R}{R/G/P}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Lukka"],
  loyalty: 5,
  compleated: true,
  text:
    "Compleated ({R/G/P} can be paid with {R}, {G}, or 2 life. If life was paid, this planeswalker enters with two fewer loyalty counters.)\n" +
    `${PLUS_TEXT}\n${MINUS_ONE_TEXT}\n${MINUS_FOUR_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { all: ["R", "G"] },
        amount: 1,
        spendOnly: {
          spell: { type: "creature" },
          abilityOf: { type: "creature" },
          text: "Spend this mana only to cast creature spells or activate abilities of creatures.",
        },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Beast Token", count: 1 },
      resolve: null,
      text: MINUS_ONE_TEXT,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "any-number",
          of: { kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } },
        },
      ],
      divided: {
        total: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
        slot: 0,
      },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: MINUS_FOUR_TEXT,
    },
  ],
});
