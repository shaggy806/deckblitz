import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Rulings:
//   When Zuko, Conflicted is under an opponent's control, his triggered ability will trigger in
//     their first main phase, and they will make all choices for the ability.
//   In a multiplayer game, if Zuko, Conflicted's owner leaves the game, Zuko, Conflicted leaves the
//     game with them. If his controller leaves the game, Zuko, Conflicted is exiled (assuming that
//     player wasn't also Zuko, Conflicted's owner).
//
// "And you lose 2 life" is in every mode: with none left to choose the ability is removed from the
// stack (rule 700.2), and nothing is lost.
const TEXT =
  "At the beginning of your first main phase, choose one that hasn't been chosen and you lose 2 life —\n• Draw a card.\n• Put a +1/+1 counter on Zuko.\n• Add {R}.\n• Exile Zuko, then return him to the battlefield under an opponent's control.";

const andLose2 = (effect: EffectSpec): EffectSpec => ({
  kind: "sequence",
  effects: [{ kind: "lose-life", amount: 2, who: "you" }, effect],
});

export default defineCard({
  name: "Zuko, Conflicted",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Draw a card.", effect: andLose2({ kind: "draw", amount: 1 }) },
          {
            text: "Put a +1/+1 counter on Zuko.",
            effect: andLose2({ kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 }),
          },
          { text: "Add {R}.", effect: andLose2({ kind: "add-mana", mana: "R", amount: 1 }) },
          {
            text: "Exile Zuko, then return him to the battlefield under an opponent's control.",
            effect: andLose2({
              kind: "choose-opponent",
              then: { kind: "flicker", target: "source", under: "that-player" },
            }),
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
