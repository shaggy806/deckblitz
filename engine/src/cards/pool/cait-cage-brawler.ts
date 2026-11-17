import type { EffectAmount } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 12538. The defending player is the attack trigger's
// `"trigger-player"`. Each player chooses their discard in turn order and the
// cards are discarded together (rule 101.4); "you discarded the card with the
// greatest mana value among those cards or tied for greatest" is Scythe
// Specter's comparison: a card you discarded this way whose mana value is the
// greatest among every card discarded this way.

const INDESTRUCTIBLE_TEXT = "During your turn, Cait has indestructible.";
const ATTACK_TEXT =
  "Whenever Cait attacks, you and defending player each draw a card, then discard a card. Put two +1/+1 counters on Cait if you discarded the card with the greatest mana value among those cards or tied for greatest.";

const GREATEST: EffectAmount = { aggregate: "max", of: "mana-value", filter: {}, in: { thisWay: "discarded" } };

export default defineCard({
  name: "Cait, Cage Brawler",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: `${INDESTRUCTIBLE_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", who: { youAnd: "trigger-player" }, amount: 1 },
          { kind: "discard", target: { youAnd: "trigger-player" }, amount: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "this-way",
              what: "discarded",
              who: "you",
              filter: { manaValue: { op: "eq", n: { amount: GREATEST } } },
            },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
