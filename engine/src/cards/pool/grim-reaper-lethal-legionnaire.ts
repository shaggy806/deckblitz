import { defineCard } from "../define.js";

// EDHREC rank 19598.
//
// "You may pay {3}{B}. When you do, …" — a `may` with a mana cost and a
// reflexive trigger that targets once it's paid (Zoraline, Cosmos Caller's
// shape). The returned creature enters attacking a player or planeswalker its
// controller chooses (rule 508.4); it was never declared as an attacker.
const RETURN_TEXT =
  "When you do, return target creature card from your graveyard to the battlefield tapped and attacking with a finality counter on it.";
const ATTACK_TEXT = `Whenever Grim Reaper attacks, you may pay {3}{B}. ${RETURN_TEXT}`;

export default defineCard({
  name: "Grim Reaper, Lethal Legionnaire",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 4,
  text: `${ATTACK_TEXT} (If a creature with a finality counter on it would die, exile it instead.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {3}{B} to return a creature card from your graveyard tapped and attacking?",
        cost: "{3}{B}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
          effect: {
            kind: "put-onto-battlefield",
            target: 0,
            enterTapped: true,
            attacking: "choose",
            withCounters: { kind: "finality", amount: 1 },
          },
          text: RETURN_TEXT,
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
