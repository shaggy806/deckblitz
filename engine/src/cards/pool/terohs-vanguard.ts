import { defineCard } from "../define.js";

// EDHREC rank 31996. Centaur Chieftain's shape: the enters trigger exists only
// while threshold holds; it reaches the creatures you control as it resolves.

const ENTER_TEXT = "When this creature enters, creatures you control gain protection from black until end of turn.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature has "${ENTER_TEXT}"`;

export default defineCard({
  name: "Teroh's Vanguard",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 2,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: {
            kind: "grant-protection",
            filter: { type: "creature", controlledBy: "you" },
            from: { colors: ["B"] },
            duration: "end-of-turn",
          },
          resolve: null,
          text: ENTER_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
