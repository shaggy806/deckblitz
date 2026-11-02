import { defineCard } from "../define.js";

// "You may waterbend {10}" is an optional additional cost (rule 601.2b), a
// kicker by another name (Ruinous Waterbending): paid, the whole next turn
// instead of the next combat phase.
export default defineCard({
  name: "Secret of Bloodbending",
  manaCost: "{U}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "As an additional cost to cast this spell, you may waterbend {10}. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)\nYou control target opponent during their next combat phase. If this spell's additional cost was paid, you control that player during their next turn instead. (You see all cards that player could see and make all decisions for them.)\nExile Secret of Bloodbending.",
  targets: ["opponent"],
  effect: { kind: "control-player", target: 0, during: "next-combat" },
  kicker: {
    cost: "{10}",
    keyword: "waterbend",
    effect: { kind: "control-player", target: 0 },
  },
  exileOnResolve: true,
});
