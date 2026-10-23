import { defineCard } from "../define.js";

// EDHREC rank 9286.
//
// Rulings:
//   [2016-01-22] Exiling Kozilek's Return due to the last ability isn't the same as casting it as
//     a spell. Cards that say "Counter target spell" won't work.
//   [2016-01-22] The last ability triggers only if Kozilek's Return is in your graveyard as you
//     cast the Eldrazi creature spell. That ability will resolve before the Eldrazi creature spell
//     does. In other words, that Eldrazi won't be on the battlefield yet and won't be dealt damage
//     by Kozilek's Return.

const GRAVEYARD_TEXT =
  "Whenever you cast an Eldrazi creature spell with mana value 7 or greater, you may exile this card from your graveyard. If you do, this card deals 5 damage to each creature.";

export default defineCard({
  name: "Kozilek's Return",
  manaCost: "{2}{R}",
  colors: [],
  types: ["instant"],
  text: `Devoid (This card has no color.)\nKozilek's Return deals 2 damage to each creature.\n${GRAVEYARD_TEXT}`,
  targets: [],
  effect: { kind: "damage-all", amount: 2, filter: { type: "creature" } },
  triggered: [
    {
      // Works only from the graveyard (rule 113.6k: it moves its own card out
      // of that zone) — Council's Deliberation's shape.
      fromGraveyard: true,
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { type: "creature", subtype: "Eldrazi", manaValue: { op: "gte", n: 7 } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Kozilek's Return from your graveyard to deal 5 damage to each creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "source" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: { kind: "damage-all", amount: 5, filter: { type: "creature" } },
            },
          ],
        },
      },
      resolve: null,
      text: GRAVEYARD_TEXT,
    },
  ],
});
