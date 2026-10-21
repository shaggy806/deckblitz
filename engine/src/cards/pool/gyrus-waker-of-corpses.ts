import { defineCard } from "../define.js";

// EDHREC rank 19022.
//
// Rulings:
//   The token copies the card as printed (`asCard`), not anything that
//   modified it before; it was never declared as an attacker, and you choose
//   which player or planeswalker it attacks. A Gyrus that wasn't cast enters
//   with no counters.
//
// "Lesser power" compares the card's power with Gyrus's, as the target is
// chosen and again as it resolves. "If you do" is the exile having happened.

const ENTERS_TEXT =
  "Gyrus enters with a number of +1/+1 counters on it equal to the amount of mana spent to cast it.";
const ATTACK_TEXT =
  "Whenever Gyrus attacks, you may exile target creature card with lesser power from your graveyard. If you do, create a token that's a copy of that card and that's tapped and attacking. Exile the token at end of combat.";

export default defineCard({
  name: "Gyrus, Waker of Corpses",
  manaCost: "{X}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { manaSpentOf: "source" } } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", power: { op: "lt", n: { amount: { powerOf: "source" } } } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Exile that creature card to create a token copy of it that's tapped and attacking?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "create-token-copy",
                of: 0,
                count: 1,
                who: "you",
                asCard: true,
                tapped: true,
                attacking: "choose",
                exileAtEndOfCombat: true,
              },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
