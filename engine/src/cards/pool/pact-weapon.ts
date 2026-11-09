import { defineCard } from "../define.js";

// X is the mana value of the card actually drawn: a replaced draw (the ruling)
// leaves no card, so no bonus and no life lost.
const STATIC_TEXT = "As long as this Equipment is attached to a creature, you don't lose the game for having 0 or less life.";
const ATTACK_TEXT =
  "Whenever equipped creature attacks, draw a card and reveal it. The creature gets +X/+X until end of turn and you lose X life, where X is that card's mana value.";
const X = { manaValueOf: { thisWay: "drawn" } } as const;

export default defineCard({
  name: "Pact Weapon",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${ATTACK_TEXT}\nEquip—Discard a card.`,
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "reveal-drawn" },
          { kind: "modify-pt", target: "trigger-object", power: X, toughness: X, duration: "end-of-turn" },
          { kind: "lose-life", amount: X },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: "Equip—Discard a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      prohibits: [{ act: "lose-game", who: "you", only: "zero-life" }],
      text: STATIC_TEXT,
    },
  ],
});
