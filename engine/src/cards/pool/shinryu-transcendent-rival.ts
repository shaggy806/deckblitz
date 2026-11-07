import { defineCard } from "../define.js";

// Final Fantasy (FIN). The back face of Zenos yae Galvus // Shinryu,
// Transcendent Rival.
//
// "As this creature transforms into Shinryu, choose an opponent" (rule
// 712.20) is `choosePlayerOnTransform`: asked as the transform happens, kept
// as its chosen player. Entering with this face up isn't transforming, so
// nobody is chosen (the ruling) and Burning Chains names nobody. "When the
// chosen player loses the game" matches as they lose (rule 104.3), conceding
// included (104.3a); "you win the game" is rule 104.2b.

const CHOOSE = "As this creature transforms into Shinryu, choose an opponent.";
const BURNING_CHAINS = "Burning Chains — When the chosen player loses the game, you win the game.";

export default defineCard({
  name: "Shinryu, Transcendent Rival",
  manaCost: "",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Dragon"],
  power: 8,
  toughness: 8,
  keywords: ["flying"],
  text: `Flying\n${CHOOSE}\n${BURNING_CHAINS}`,
  choosePlayerOnTransform: "opponent",
  triggered: [
    {
      trigger: { on: "player-loses-game", who: "chosen-player" },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: BURNING_CHAINS,
    },
  ],
  faces: ["Zenos yae Galvus", "Shinryu, Transcendent Rival"],
  transform: true,
});
