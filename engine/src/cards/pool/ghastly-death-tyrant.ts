import { defineCard } from "../define.js";

// Disintegration Ray's life loss reads the target's mana value whether or not it was destroyed
// (an indestructible enchantment still costs the life), as Feed the Swarm's does.

const ENTER_TEXT = "When this creature enters, choose one —";
const RAY_TEXT =
  "Disintegration Ray — Destroy target enchantment an opponent controls. You lose life equal to its mana value.";
const DEATH_TEXT = "Death Ray — Creatures you control gain deathtouch until end of turn.";

export default defineCard({
  name: "Ghastly Death Tyrant",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beholder", "Skeleton"],
  power: 6,
  toughness: 5,
  text: `${ENTER_TEXT}\n• ${RAY_TEXT}\n• ${DEATH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: RAY_TEXT,
            targets: [{ kind: "permanent", whose: "opponent", filter: { type: "enchantment" } }],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "destroy", target: 0 },
                { kind: "lose-life", amount: { manaValueOf: 0 } },
              ],
            },
          },
          {
            text: DEATH_TEXT,
            effect: {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "deathtouch",
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
