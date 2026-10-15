import { defineCard } from "../define.js";

const MAIN_TEXT =
  "At the beginning of your first main phase, you may discard a card. When you do, target creature can't block this turn.";
const SONIC_TEXT = "Sonic Blast — Whenever a creature an opponent controls dies, Shriek deals 1 damage to that player.";

export default defineCard({
  name: "Shriek, Treblemaker",
  manaCost: "{2}{B/R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Villain"],
  power: 2,
  toughness: 3,
  text: `${MAIN_TEXT}\n${SONIC_TEXT}`,
  triggered: [
    {
      // "When you do" is a reflexive trigger (rule 603.12), its target chosen
      // only once a card has actually been discarded (Ty Lee's shape).
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to have target creature not block this turn?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "reflexive-trigger",
                targets: ["creature"],
                effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
                text: "When you do, target creature can't block this turn.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: MAIN_TEXT,
    },
    {
      // Gimli, Counter of Kills: "that player" is the dead creature's controller.
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: SONIC_TEXT,
    },
  ],
});
