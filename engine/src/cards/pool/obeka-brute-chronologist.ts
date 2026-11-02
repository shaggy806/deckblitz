import { defineCard } from "../define.js";

// Whoever activates it, the player whose turn it is decides, as the ability
// resolves. If they say no, nothing else happens and the ability leaves the
// stack as usual; if yes, rule 724.1.
export default defineCard({
  name: "Obeka, Brute Chronologist",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Ogre", "Wizard"],
  power: 3,
  toughness: 4,
  text: `{T}: The player whose turn it is may end the turn. (Exile all spells and abilities from the stack. The player whose turn it is discards down to their maximum hand size. Damage wears off, and "this turn" and "until end of turn" effects end.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "End the turn?",
        effect: { kind: "end-the-turn" },
      },
      resolve: null,
      text: "{T}: The player whose turn it is may end the turn.",
    },
  ],
});
