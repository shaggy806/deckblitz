import { defineCard } from "../define.js";

// Warhammer 40,000 Commander. "The last chosen player": each combat's choice
// replaces the one before, kept on this creature (`remember`) for as long as
// it stays on the battlefield; a new object chooses afresh (rule 400.7).

const RELAY =
  "Targeting Relay — At the beginning of combat on your turn, choose an opponent. Creatures attacking the last chosen player have menace.";

export default defineCard({
  name: "Triarch Stalker",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 4,
  toughness: 5,
  text: RELAY,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "choose-opponent", remember: true, then: { kind: "sequence", effects: [] } },
      resolve: null,
      text: RELAY,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attackingChosenPlayer: true } },
      grantKeywords: ["menace"],
      text: RELAY,
    },
  ],
});
