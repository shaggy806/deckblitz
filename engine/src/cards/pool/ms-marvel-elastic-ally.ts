import { defineCard } from "../define.js";

// EDHREC rank 27425.
//
// The power check is read as the combat damage is dealt.

const DRAW_TEXT =
  "Whenever a creature you control with power greater than its base power deals combat damage to a player, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Ms. Marvel, Elastic Ally",
  manaCost: "{2}{G/W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Inhuman", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\nWhen Ms. Marvel enters, target creature gets +2/+0 until end of turn.\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "When Ms. Marvel enters, target creature gets +2/+0 until end of turn.",
    },
    {
      trigger: {
        on: "deals-damage",
        who: "you-control",
        filter: { type: "creature", power: { op: "gt", n: { own: "basePower" } } },
        to: "player",
        combat: true,
      },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
