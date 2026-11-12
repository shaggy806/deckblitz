import { defineCard } from "../define.js";

// EDHREC rank 11002.

const GAIN_TEXT =
  "Whenever you gain life, put a +1/+1 counter on target creature you control. It gains indestructible until end of turn.";

export default defineCard({
  name: "Spider-Man, Peter Parker",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${GAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
