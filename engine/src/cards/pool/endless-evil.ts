import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, create a token that's a copy of enchanted creature, except the token is 1/1.";
const DIES_TEXT = "When enchanted creature dies, if that creature was a Horror, return this card to its owner's hand.";

export default defineCard({
  name: "Endless Evil",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${UPKEEP_TEXT}\n${DIES_TEXT}`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "create-token-copy", of: "enchanted", count: 1, who: "you", basePt: [1, 1] },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "dies", who: "attached" },
      condition: { kind: "trigger-object", filter: { subtype: "Horror" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
