import { defineCard } from "../define.js";

// "The exiled card" is the one exiled until this leaves (rules 607.2a, 610.3).
// One copy for each opponent, attacking that opponent as it enters (rule 508.4)
// if it's a creature (rule 506.3); each is sacrificed at your own next end step.
// A token exiled ceases to exist (rule 111.7), so nothing is copied.
const ENTERS_TEXT = "When this creature enters, exile up to one other target creature you control until this creature leaves the battlefield.";
const ATTACKS_TEXT =
  "Whenever this creature attacks, for each opponent, create a tapped token that's a copy of the exiled card attacking that opponent. At the beginning of your next end step, sacrifice those tokens.";

export default defineCard({
  name: "Mardu Siegebreaker",
  manaCost: "{1}{R}{W}{B}",
  colors: ["R", "W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch", "haste"],
  text: `Deathtouch, haste\n${ENTERS_TEXT}\n${ATTACKS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "create-token-copy",
              of: "exiled-with-source",
              count: 1,
              tapped: true,
              attacking: { player: "that-player" },
              sacrificeAtEndStep: true,
              atYourNextEndStep: true,
            },
          },
        ],
      },
      resolve: null,
      text: ATTACKS_TEXT,
    },
  ],
});
