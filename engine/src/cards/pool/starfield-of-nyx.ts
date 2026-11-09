import { defineCard } from "../define.js";

const UPKEEP = "At the beginning of your upkeep, you may return target enchantment card from your graveyard to the battlefield.";
const STATIC_TEXT =
  "As long as you control five or more enchantments, each other non-Aura enchantment you control is a creature in addition to its other types and has base power and base toughness each equal to its mana value.";

export default defineCard({
  name: "Starfield of Nyx",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "enchantment" } }],
      effect: {
        kind: "may",
        prompt: "Return that enchantment card to the battlefield?",
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "enchantment", notSubtypes: ["Aura"], controlledBy: "you" },
        excludeSelf: true,
      },
      condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 5, countsSelf: true },
      addTypes: ["creature"],
      setBasePt: { power: "its-mana-value", toughness: "its-mana-value" },
      text: STATIC_TEXT,
    },
  ],
});
