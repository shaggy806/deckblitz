import { defineCard } from "../define.js";

// EDHREC rank 12817. Sylvan Offering's shape: each sentence chooses its own
// opponent as the spell resolves (not a target — the rulings). "You and that
// player each sacrifice a creature" is one event; each player draws only if
// they sacrificed one this way (no creature, no draw). Then you choose a
// creature card from your graveyard, and after it the chosen opponent chooses
// one from theirs; neither is targeted.

const SAC_TEXT =
  "Choose an opponent. You and that player each sacrifice a creature. Each player who sacrificed a creature this way draws two cards.";
const RETURN_TEXT =
  "Choose an opponent. Return a creature card from your graveyard to the battlefield, then that player returns a creature card from their graveyard to the battlefield.";

export default defineCard({
  name: "Infernal Offering",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${SAC_TEXT}\n${RETURN_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-opponent",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "sequence",
              simultaneous: true,
              effects: [
                { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
                { kind: "sacrifice", who: "that-player", filter: { type: "creature" }, count: 1 },
              ],
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", who: "you" },
              then: { kind: "draw", amount: 2 },
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", who: "that-player" },
              then: { kind: "draw", amount: 2, who: "that-player" },
            },
          ],
        },
      },
      {
        kind: "choose-opponent",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "graveyard",
              filter: { type: "creature" },
              min: 1,
              max: 1,
              destination: "battlefield",
              leftover: "stay",
            },
            {
              kind: "look-and-choose",
              zone: "graveyard",
              player: "that-player",
              filter: { type: "creature" },
              min: 1,
              max: 1,
              destination: "battlefield",
              leftover: "stay",
            },
          ],
        },
      },
    ],
  },
});
