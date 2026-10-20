import { defineCard } from "../define.js";

// EDHREC rank 11751.
//
// Rulings:
//   [2022-02-18] You choose how to distribute the counters as you activate Myojin of Towering
//     Might's last ability. Each target must get at least one counter. Notably, you cannot choose
//     more than eight targets just to give more creatures trample.
//
// The enters-with counter is Patched Plaything's shape (cast by you, from your
// hand). The division is announced on activation (`divided`, Ajani, Sleeper
// Agent's shape); one to eight targets, each getting at least one.
const ENTER_TEXT =
  "Myojin of Towering Might enters with an indestructible counter on it if you cast it from your hand.";
const ACT_TEXT =
  "Remove an indestructible counter from Myojin of Towering Might: Distribute eight +1/+1 counters among any number of target creatures you control. They gain trample until end of turn.";

export default defineCard({
  name: "Myojin of Towering Might",
  manaCost: "{5}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 8,
  toughness: 8,
  text: `${ENTER_TEXT}\n${ACT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "indestructible",
          amount: {
            ifCondition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
            then: 1,
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "indestructible", count: 1 } },
      targets: [{ kind: "any-number", of: "creature-you-control", min: 1, max: 8 }],
      divided: { total: 8, slot: 0, of: "+1/+1 counters" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "counters-divided", from: 0, counter: "+1/+1" },
          {
            kind: "for-each-target",
            from: 0,
            effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: ACT_TEXT,
    },
  ],
});
