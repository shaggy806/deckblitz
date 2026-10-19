import { defineCard } from "../define.js";

// EDHREC rank 15001.
//
// Which creature to return, and whether to, is chosen as the attack trigger
// resolves — it doesn't target (the ruling). Gravelgill Scoundrel's shape.
const SCRY_TEXT = "When this creature enters, scry 3.";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may return another creature you control to its owner's hand. If you do, this creature can't be blocked this turn.";

export default defineCard({
  name: "Biblioplex Kraken",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 4,
  toughness: 5,
  text: `${SCRY_TEXT} (Look at the top three cards of your library, then put any number of them on the bottom and the rest on top in any order.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 3 },
      resolve: null,
      text: SCRY_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            min: 0,
            upTo: 1,
            exceptSource: true,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "You may return another creature you control to its owner's hand",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
