import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const FOOD_TEXT = "Whenever this enchantment or a legendary creature you control enters, create a Food token.";
const ATTACK_TEXT =
  "Whenever you attack, you may sacrifice X Foods. When you do, up to X target attacking creatures each get +3/+3 and gain trample and indestructible until end of turn.";

const FOODS = { subtype: "Food", controlledBy: "you" } as const;

// The sacrifice is the attack trigger's own; the reflexive ability's group is
// bounded by how many Foods it sacrificed (its `value`).
export default defineCard({
  name: "Campsite Cuisine",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${FOOD_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", supertype: "legendary" } },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    }),
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: FOODS,
            min: 0,
            upTo: { countOf: FOODS },
            then: { kind: "sacrifice-target", target: 0 },
            prompt: "Sacrifice any number of Foods",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
            then: {
              kind: "reflexive-trigger",
              value: { thisWay: "sacrificed" },
              targets: [
                {
                  kind: "any-number",
                  of: { kind: "permanent", filter: { type: "creature", attacking: true } },
                  max: { triggerValue: true },
                },
              ],
              effect: {
                kind: "for-each-target",
                from: 0,
                effect: {
                  kind: "sequence",
                  effects: [
                    { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
                    { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
                    { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
                  ],
                },
              },
              text: "When you do, up to X target attacking creatures each get +3/+3 and gain trample and indestructible until end of turn.",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
