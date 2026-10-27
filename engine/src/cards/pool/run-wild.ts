import { defineCard } from "../define.js";
import type { ActivatedAbility } from "../../abilities.js";

// Onslaught. EDHREC rank 26843. Seedling Charm's trample grant beside
// Banishing Knack's one-shot ability grant (a troll's regeneration).

const GRANTED_TEXT = "{G}: Regenerate this creature.";
const REGENERATE: ActivatedAbility = {
  cost: { mana: "{G}", tap: false },
  targets: [],
  effect: { kind: "regenerate", target: "source" },
  resolve: null,
  text: GRANTED_TEXT,
};

export default defineCard({
  name: "Run Wild",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Until end of turn, target creature gains trample and "${GRANTED_TEXT}"`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "grant-activated", target: 0, ability: REGENERATE, duration: "end-of-turn" },
    ],
  },
});
