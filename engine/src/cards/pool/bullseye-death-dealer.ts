import { defineCard } from "../define.js";

// The enter trigger's "may sacrifice an artifact or discard a nonland card"
// is a choice of two payments as it resolves (each-player-may's options,
// Cornered Crook's shape), its "when you do" a reflexive trigger (rule
// 603.12). The activated ability's cost is one choice of whole costs
// (`AbilityCost.options`), chosen as it's activated (rule 602.2b).

const ENTER_TEXT =
  "When Bullseye enters, you may sacrifice an artifact or discard a nonland card. When you do, Bullseye deals 2 damage to any target.";
const ACTIVATED_TEXT = "{3}, {T}, Sacrifice an artifact or discard a nonland card: Bullseye deals 2 damage to any target.";

export default defineCard({
  name: "Bullseye, Death Dealer",
  manaCost: "{2}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Assassin", "Villain"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT}\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" },
          { discard: 1, filter: { notTypes: ["land"] }, text: "Discard a nonland card" },
        ],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["any-target"],
          effect: { kind: "damage", amount: 2, target: 0 },
          text: "When you do, Bullseye deals 2 damage to any target.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{3}",
        tap: true,
        options: [
          { cost: { sacrifice: { filter: { type: "artifact" } } }, text: "Sacrifice an artifact" },
          { cost: { discard: { count: 1, filter: { notTypes: ["land"] } } }, text: "Discard a nonland card" },
        ],
      },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
