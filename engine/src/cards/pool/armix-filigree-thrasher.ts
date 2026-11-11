import { defineCard } from "../define.js";

// The attack trigger goes on the stack without a target; discarding as it
// resolves triggers the reflexive ability (rule 603.12), whose target is
// chosen then (the ruling). "Defending player" is the player Armix is
// attacking — the controller of a planeswalker it's attacking (the ruling) —
// or was attacking before it left combat (rule 508.5). X is read as the
// reflexive ability resolves, the discarded card counted if it's an artifact.
const X = {
  product: [
    { sum: [{ countOf: { type: "artifact", controlledBy: "you" } }, { countInGraveyard: { type: "artifact", ownedBy: "you" } }] },
    -1,
  ],
} as const;
const WHEN_YOU_DO =
  "When you do, target creature defending player controls gets -X/-X until end of turn, where X is the number of " +
  "artifacts you control plus the number of artifact cards in your graveyard.";
const ATTACK_TEXT = `Whenever Armix attacks, you may discard a card. ${WHEN_YOU_DO}`;

export default defineCard({
  name: "Armix, Filigree Thrasher",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 2,
  pairing: { kind: "partner" },
  text: `${ATTACK_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "reflexive-trigger",
                targets: ["creature-defending-player-controls"],
                effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
                text: WHEN_YOU_DO,
              },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
