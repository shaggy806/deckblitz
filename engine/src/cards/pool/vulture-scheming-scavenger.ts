import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever Vulture attacks, other Villains you control gain flying until end of turn.";

export default defineCard({
  name: "Vulture, Scheming Scavenger",
  manaCost: "{5}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Villain"],
  power: 4,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      // The Villains are fixed as it resolves (rule 611.2c), Vulture spared.
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { subtype: "Villain", controlledBy: "you" },
        keyword: "flying",
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
