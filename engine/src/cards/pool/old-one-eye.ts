import { defineCard } from "../define.js";

// EDHREC rank 6885.
//
// Rulings:
//   [2022-10-07] Old One-Eye's Fast Healing ability only triggers if it is in your graveyard at the
//     beginning of your precombat main phase.
//   [2022-10-07] Opponents may respond to the Fast Healing ability after it goes on the stack, but
//     they don't get the chance to cast spells or activate abilities between the time you have
//     chosen to discard two cards and the time Old One-Eye is returned to your hand.
//
// Fast Healing works only from the graveyard (rule 113.6k — Squee, Goblin
// Nabob's shape). The discard is offered only with two cards in hand, and
// "if you do" is both discarded (Thrilling Discovery's shape); "this card" is
// the card only while it's still that object there (rule 400.7).

const ANTHEM_TEXT = "Other creatures you control have trample.";
const ENTER_TEXT = "When Old One Eye enters, create a 5/5 green Tyranid creature token.";
const HEAL_TEXT =
  "Fast Healing — At the beginning of your first main phase, you may discard two cards. If you do, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Old One Eye",
  manaCost: "{5}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${ANTHEM_TEXT}\n${ENTER_TEXT}\n${HEAL_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantKeywords: ["trample"],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "5/5 Tyranid Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard two cards to return Old One Eye from your graveyard to your hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 2 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded", atLeast: 2 },
              then: { kind: "return-to-hand", target: "source", from: "graveyard" },
            },
          ],
        },
      },
      resolve: null,
      text: HEAL_TEXT,
    },
  ],
});
