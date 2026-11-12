import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. The creature that entered gains a
// combat-damage trigger that remembers the card this exile took
// (`grant-triggered`'s `remember`), so two grants copy their own two cards. The
// copy is cast from exile through `cast-now`'s `copies`; once that card has
// left exile it's a new object (rule 400.7) and there's nothing to copy.
const ENTER_TEXT =
  'Whenever Massimo or another creature you control enters, exile up to one target instant or sorcery card with mana value 1 from your graveyard. If a card is exiled this way, that creature gains "Whenever this creature deals combat damage to a player, copy the exiled card. You may cast the copy without paying its mana cost."';
const GRANTED_TEXT =
  "Whenever this creature deals combat damage to a player, copy the exiled card. You may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Massimo, the Magician",
  manaCost: "{U}{R}{W}",
  colors: ["U", "R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Wizard"],
  power: 3,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "eq", n: 1 } },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "grant-triggered",
              target: "trigger-object",
              duration: "permanent",
              remember: { card: { set: { thisWay: "exiled" } } },
              ability: {
                trigger: { on: "deals-combat-damage-to-player", who: "self" },
                targets: [],
                effect: { kind: "cast-now", target: { remembered: "card" }, copies: 1, free: true },
                resolve: null,
                text: GRANTED_TEXT,
              },
            },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
