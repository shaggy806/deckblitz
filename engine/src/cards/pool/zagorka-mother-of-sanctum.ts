import { defineCard } from "../define.js";

const END_STEP =
  "At the beginning of your end step, each player may create a tapped land token named Sanctum with \"{T}: Add one mana of any color.\" Each opponent who does can't attack you during their next turn.";

// Each player is asked in turn, the token theirs; each opponent who took one
// gets a player effect `{ duringTurnOf: "that-player" }` — nothing until their
// next turn begins, then no attacks on you through it.
export default defineCard({
  name: "Zagorka, Mother of Sanctum",
  manaCost: "{1}{G}{U}{R}",
  colors: ["G", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 4,
  toughness: 2,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${END_STEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Create a tapped Sanctum land token? An opponent who does can't attack Zagorka's controller during their next turn.",
        effect: { kind: "create-token", token: "Sanctum Token", count: 1, tapped: true },
        resultsFor: "each-opponent",
        ifDid: {
          kind: "restrict",
          filter: { type: "creature", controlledBy: "you" },
          sideOf: "that-player",
          restrictions: [{ kind: "cant-attack", at: "you" }],
          duration: { duringTurnOf: "that-player" },
        },
      },
      resolve: null,
      text: END_STEP,
    },
  ],
});
