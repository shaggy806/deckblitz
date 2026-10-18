import { defineCard } from "../define.js";

// EDHREC rank 12405.
//
// The attack trigger has no target; paying {3}{B} as it resolves fires the
// reflexive trigger, which targets then (the ruling). The Phyrexian type has
// no duration (the ruling) — `addSubtypes`, as Portal to Phyrexia's.

const RETURN_TEXT =
  "When you do, return target creature card from your graveyard to the battlefield. It's a Phyrexian in addition to its other types.";
const ATTACK_TEXT = `Whenever this creature attacks, you may pay {3}{B}. ${RETURN_TEXT}`;

export default defineCard({
  name: "Terror of Towashi",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Ogre"],
  power: 4,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {3}{B} to return a creature card from your graveyard to the battlefield?",
        cost: "{3}{B}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
          effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true, addSubtypes: ["Phyrexian"] },
          text: RETURN_TEXT,
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
