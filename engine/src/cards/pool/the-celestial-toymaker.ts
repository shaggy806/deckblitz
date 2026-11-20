import { defineCard } from "../define.js";

// EDHREC rank 17268; top-1000 commander #890. The attack trigger looks at
// the top three, the controller splits them into a face-down and a face-up
// pile, both exiled as they're made (`exilePiles`), and the defending player
// (the attack trigger's player) chooses the one put into the hand: the other
// stays in exile. The end-step count is every spell or ability that made a
// player guess or group into piles this turn, each once (the journal's
// `piled-or-guessed`), its own attack trigger among them.
const ATTACKS =
  "Whenever The Celestial Toymaker attacks, look at the top three cards of your library. Exile any number of them in a face-down pile and the rest in a face-up pile. Defending player chooses one of those piles. Put that pile into your hand.";
const END_STEP =
  "At the beginning of each end step, each opponent loses 2 life for each spell or ability that caused one or more players to guess or to group cards or permanents into a pile this turn.";

export default defineCard({
  name: "The Celestial Toymaker",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rogue", "Artificer"],
  power: 2,
  toughness: 4,
  text: `${ATTACKS}\n${END_STEP}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "separate-into-piles",
        objects: { libraryTop: 3 },
        faceDown: true,
        exilePiles: true,
        chooser: "trigger-player",
        chosen: "hand",
      },
      resolve: null,
      text: ATTACKS,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "lose-life",
        who: "each-opponent",
        amount: { product: [{ pileOrGuessEffectsThisTurn: true }, 2] },
      },
      resolve: null,
      text: END_STEP,
    },
  ],
});
