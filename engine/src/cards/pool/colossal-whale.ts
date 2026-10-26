import { defineCard } from "../define.js";

// EDHREC rank 12808.
//
// One ability, two one-shot effects (the ruling): the exile now, and the
// return as soon as the Whale leaves. If the Whale has already left as the
// trigger resolves, nothing is exiled.

const TEXT =
  "Whenever this creature attacks, you may exile target creature defending player controls until this creature leaves the battlefield.";

export default defineCard({
  name: "Colossal Whale",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 5,
  toughness: 5,
  keywords: ["islandwalk"],
  text: `Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n${TEXT} (That creature returns under its owner's control.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: {
        kind: "may",
        prompt: "Exile the target creature until Colossal Whale leaves the battlefield?",
        effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
