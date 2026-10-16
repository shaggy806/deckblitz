import { defineCard } from "../define.js";

// EDHREC rank 21826. A player effect for the rest of the turn (Armor Wars'
// "artifact spells you cast this turn cost {1} less" shape), its filter the
// face-down spell being cast (morph, megamorph, disguise — each {3} as an
// alternative cost, reduced to {2}). Each attack adds another {1}.

const TEXT = "Whenever this creature attacks, face-down spells you cast this turn cost {1} less to cast.";

export default defineCard({
  name: "Goblin Maskmaker",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Citizen"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        reduceSpells: { applies: { faceDown: true }, reduceGeneric: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
