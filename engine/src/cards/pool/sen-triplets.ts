import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, choose target opponent. This turn, that player can't cast spells or activate abilities and plays with their hand revealed. You may play lands and cast spells from that player's hand this turn.";

export default defineCard({
  name: "Sen Triplets",
  manaCost: "{2}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      resolve: null,
      text: TEXT,
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "prohibit", who: 0, spells: true, abilities: true },
          { kind: "player-effect", duration: "end-of-turn", handRevealed: 0, playFromHandOf: 0 },
        ],
      },
    },
  ],
});
