import { defineCard } from "../define.js";
import { provoke } from "../helpers.js";

// EDHREC rank 30745.

export default defineCard({
  name: "Swooping Talon",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\n{1}: This creature loses flying until end of turn.\nProvoke (Whenever this creature attacks, you may have target creature defending player controls untap and block it if able.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["flying"], duration: "end-of-turn" },
      resolve: null,
      text: "{1}: This creature loses flying until end of turn.",
    },
  ],
  triggered: [provoke()],
});
