import { defineCard } from "../define.js";

// EDHREC rank 4310.
//
// Rulings (2021-02-05):
//   Tyvar may look like an Elf, but he's not a creature with the creature
//   type Elf, so he doesn't give himself the mana ability and he can't be the
//   target of the first loyalty ability.
//   The first loyalty ability can target an Elf that's already untapped.
//   The emblem will cause the Elf spell to gain haste. That change carries
//   through to the permanent that the spell becomes.
//
// The emblem's haste is Judith, Carnage Connoisseur's grant to the spell just
// cast (`"trigger-object"` on the stack): the permanent it becomes keeps it
// until end of turn (rule 400.7a).

const MANA_TEXT = 'Elves you control have "{T}: Add {B}."';
const PLUS_TEXT =
  "+1: Put a +1/+1 counter on up to one target Elf. Untap it. It gains deathtouch until end of turn.";
const ZERO_TEXT = "0: Create a 1/1 green Elf Warrior creature token.";
const EMBLEM_TEXT = "Whenever you cast an Elf spell, it gains haste until end of turn and you draw two cards.";
const ULT_TEXT = `−6: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Tyvar Kell",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tyvar"],
  loyalty: 3,
  text: `${MANA_TEXT}\n${PLUS_TEXT}\n${ZERO_TEXT}\n${ULT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Elf", controlledBy: "you" } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "B", amount: 1 },
          resolve: null,
          text: "{T}: Add {B}.",
        },
      ],
      text: MANA_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { subtype: "Elf" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Elf Warrior Token", count: 1 },
      resolve: null,
      text: ZERO_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        triggered: [
          {
            trigger: { on: "cast-spell", who: "you", filter: { subtype: "Elf" } },
            targets: [],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" },
                { kind: "draw", amount: 2 },
              ],
            },
            resolve: null,
            text: EMBLEM_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
