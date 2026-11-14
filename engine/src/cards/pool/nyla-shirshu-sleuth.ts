import { defineCard } from "../define.js";

// The card is exiled with Nyla (linked, rule 607.2a): a new Nyla has no link
// to it (the ruling). X is the exiled card's mana value; the Clues are
// created, not investigated. The end-step "if" is an intervening one, asked
// again as it resolves (rule 603.4).
const ENTERS_TEXT =
  "When Nyla enters, exile up to one target creature card from your graveyard. If you do, you lose X life and create X Clue tokens, where X is that card's mana value.";
const END_TEXT =
  "At the beginning of your end step, if you control no Clues, return target card exiled with Nyla to its owner's hand.";
const X = { aggregate: "max", of: "mana-value", filter: {}, in: { thisWay: "exiled" } } as const;

export default defineCard({
  name: "Nyla, Shirshu Sleuth",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mole", "Beast"],
  power: 4,
  toughness: 5,
  text: `${ENTERS_TEXT} (A Clue token is an artifact with "{2}, Sacrifice this token: Draw a card.")\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, linked: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", who: "you", amount: X },
                { kind: "create-token", token: "Clue Token", count: X },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Clue" }, atLeast: 1 } },
      targets: [{ kind: "card-in-exile", linked: true }],
      effect: { kind: "return-to-hand", target: 0, from: "exile" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
