import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// The target is chosen after the discard (the ruling): a reflexive ability, which
// keeps the creating trigger's event, so "that player" is still the one dealt
// damage.
const WHEN_TEXT = "When you do, destroy target creature or planeswalker that player controls.";
const TEXT = `Whenever this creature deals combat damage to a player, you may discard a creature card. ${WHEN_TEXT}`;

export default defineCard({
  name: "Dokuchi Silencer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 2,
  toughness: 1,
  text: `${ninjutsuText("{1}{B}")}\n${TEXT}`,
  activated: [ninjutsu("{1}{B}")],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a creature card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1, filter: { type: "creature" } },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "reflexive-trigger",
                targets: [
                  { kind: "permanent", whose: "trigger-player", filter: { typesAnyOf: ["creature", "planeswalker"] } },
                ],
                effect: { kind: "destroy", target: 0 },
                text: WHEN_TEXT,
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
