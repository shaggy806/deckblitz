import { defineCard } from "../define.js";

// Both triggers read the creature as it attacks / deals the damage: it must
// still have deathtouch then (the ruling). "Deals damage to a planeswalker"
// names a recipient, so it fires once per planeswalker dealt damage.
const ATTACK_TEXT =
  "Whenever a creature you control with deathtouch attacks, each opponent loses 1 life and you gain 1 life.";
const PW_TEXT =
  "Whenever a creature you control with deathtouch deals damage to a planeswalker, destroy that planeswalker.";

export default defineCard({
  name: "Hooded Blightfang",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ATTACK_TEXT}\n${PW_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", keyword: "deathtouch" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: {
        on: "deals-damage",
        who: "you-control",
        filter: { type: "creature", keyword: "deathtouch" },
        to: "planeswalker",
      },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient" },
      resolve: null,
      text: PW_TEXT,
    },
  ],
});
