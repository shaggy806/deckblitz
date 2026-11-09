import { defineCard } from "../define.js";

const LIFE_TEXT =
  "When this Aura enters, if you control a Desert or there is a Desert card in your graveyard, you gain 3 life.";
const HOLD_TEXT = "Enchanted creature can't attack or block, and its activated abilities can't be activated.";

export default defineCard({
  name: "Desert's Hold",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${LIFE_TEXT}\n${HOLD_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
          { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Desert" } },
        ],
      },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: [{ act: "activate", who: "each-player", of: { hostOfSource: true } }],
      text: HOLD_TEXT,
    },
  ],
});
