import { defineCard } from "../define.js";

// EDHREC rank 13310. Each opponent reveals the top card of their library, all
// of them before anything else (`reveal-top`'s `who`, rule 701.20a); the
// cards stay where they are. "If any of those cards shares a card type with
// that spell" counts the revealed cards sharing a card type with the spell
// that triggered it (`{ thisWay: "revealed" }` with `sharesCardTypeWith:
// "trigger-object"`, a cast trigger's object being the spell, as it last
// existed once it has left the stack): one copy however many share, or how many types (the
// rulings). The copy is made on the stack, not cast (rule 707.10), may take
// new targets, and resolves before the original; a copy of a permanent spell
// becomes a token (rule 608.3f). An opponent with an empty library reveals
// nothing.

const TEXT =
  "Whenever you cast a spell with mana value 5 or greater, each opponent reveals the top card of their library. If any of those cards shares a card type with that spell, copy that spell, you may choose new targets for the copy, and each opponent draws a card. Otherwise, you draw a card. (A copy of a permanent spell becomes a token.)";

export default defineCard({
  name: "Gandalf, Westward Voyager",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Avatar", "Wizard"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 5 } } },
      targets: [],
      effect: {
        kind: "reveal-top",
        who: "each-opponent",
        then: {
          kind: "conditional",
          condition: {
            kind: "amounts",
            left: { thisWay: "revealed", filter: { sharesCardTypeWith: "trigger-object" } },
            op: "gte",
            right: 1,
          },
          then: {
            kind: "sequence",
            effects: [
              { kind: "copy-spell", target: "trigger-spell", newTargets: true },
              { kind: "draw", amount: 1, who: "each-opponent" },
            ],
          },
          else: { kind: "draw", amount: 1 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
