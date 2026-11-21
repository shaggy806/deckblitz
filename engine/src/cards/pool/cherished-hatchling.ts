import { defineCard } from "../define.js";

// EDHREC rank 18641.
//
// Rulings:
//   [2018-01-19] You must pay the costs for spells you cast this way.
//   [2018-01-19] During the turn Cherished Hatchling dies, you may cast any number of Dinosaurs as
//     though they had flash.
//   [2018-01-19] For the triggered ability that the entering Dinosaur gains, if the target is
//     illegal when it tries to resolve or if the Dinosaur that entered the battlefield has left
//     the battlefield, no creature will deal or be dealt damage.
//   [2018-01-19] For the triggered ability that the entering Dinosaur gains, you choose a target
//     when the ability goes on the stack, but you don't choose until that ability resolves whether
//     those creatures fight.
// "Whenever you cast a Dinosaur spell this turn" is a delayed triggered ability
// (rule 603.7c). As it resolves, the spell gains the enters trigger: an effect
// on a permanent spell that goes on applying to the permanent it becomes (rule
// 400.7a — `grant-triggered` on the spell, as Rivaz of the Claw's).

const FIGHT_TEXT = "When this creature enters, you may have it fight another target creature.";
const GAINS_TEXT = `Whenever you cast a Dinosaur spell this turn, it gains "${FIGHT_TEXT}"`;
const TEXT =
  "When this creature dies, you may cast Dinosaur spells this turn as though they had flash, and whenever you " +
  `cast a Dinosaur spell this turn, it gains "${FIGHT_TEXT}"`;

export default defineCard({
  name: "Cherished Hatchling",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "player-effect",
            duration: "end-of-turn",
            castAsThoughFlash: { filter: { subtype: "Dinosaur" } },
          },
          {
            kind: "delayed-trigger",
            at: { whenever: { on: "cast-spell", who: "you", filter: { subtype: "Dinosaur" } } },
            effect: {
              kind: "grant-triggered",
              target: "trigger-object",
              duration: "permanent",
              ability: {
                trigger: { on: "enters-battlefield", who: "self" },
                targets: [{ kind: "other", of: "creature" }],
                effect: {
                  kind: "may",
                  prompt: "Have this creature fight the target creature?",
                  effect: { kind: "fight", a: "source", b: 0 },
                },
                resolve: null,
                text: FIGHT_TEXT,
              },
            },
            text: GAINS_TEXT,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
