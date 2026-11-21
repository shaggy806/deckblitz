import { defineCard } from "../define.js";

// EDHREC rank 17126.
//
// The first ability: one creature (or none) chosen for each opponent, in
// turn, then all of them tapped at the same time (the ruling) — a
// `for-each-player` of `choicesHeld` whose taps wait for the release
// (`tap.atRelease`), a creature already chosen not chosen again. Each
// creature tapped is its own reflexive ability (rule 603.12), "that player"
// the opponent it was chosen for (the iteration's trigger player) and the
// tapped creature its trigger object, read as it last existed if it's gone
// (the rulings) — its power is checked as the target is chosen and again as
// it resolves (rule 608.2b). Control lasts while you control Nihiloor; once
// it's left, none is gained (the ruling).
//
// The second: "a creature an opponent owns" attacking, each its own trigger;
// "that player" is its owner.

const ENTERS_TEXT =
  "When Nihiloor enters, for each opponent, tap up to one untapped creature you control. When you do, gain control of target creature that player controls with power less than or equal to the tapped creature's power for as long as you control Nihiloor.";
const STEAL_TEXT =
  "When you do, gain control of target creature that player controls with power less than or equal to the tapped creature's power for as long as you control Nihiloor.";
const ATTACK_TEXT = "Whenever you attack with a creature an opponent owns, you gain 2 life and that player loses 2 life.";

export default defineCard({
  name: "Nihiloor",
  manaCost: "{2}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 5,
  text: `${ENTERS_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        choicesHeld: true,
        effect: {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you", tapped: false, notThisWay: "chosen" },
          upTo: 1,
          thenTogether: true,
          prompt: "Tap up to one untapped creature you control for this opponent",
          then: {
            kind: "sequence",
            effects: [
              { kind: "tap", target: 0, atRelease: true },
              {
                kind: "reflexive-trigger",
                about: 0,
                targets: [
                  {
                    kind: "permanent",
                    whose: "trigger-player",
                    filter: { type: "creature", power: { op: "lte", n: { amount: { powerOf: "trigger-object" } } } },
                  },
                ],
                effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
                text: STEAL_TEXT,
              },
            ],
          },
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", ownedBy: "opponent" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "lose-life", amount: 2, who: { ownerOf: "trigger-object" } },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
