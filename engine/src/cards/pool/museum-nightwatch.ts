import { defineCard } from "../define.js";

// Disguise {1}{W} (rule 702.168). A face-down Nightwatch has no abilities, so
// it makes no Detective if it dies face down.

const DIES_TEXT = "When this creature dies, create a 2/2 white and blue Detective creature token.";

export default defineCard({
  name: "Museum Nightwatch",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Centaur", "Soldier"],
  power: 3,
  toughness: 2,
  text: `${DIES_TEXT}\nDisguise {1}{W} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)`,
  morph: { keyword: "disguise", cost: "{1}{W}" },
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Detective Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
