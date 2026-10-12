import { defineCard } from "../define.js";
import { START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 16949. "It" is the enchantment, sacrificed to pay for its own
// ability: the damage comes from it as it last existed (rule 608.2h). "Each
// player who doesn't have max speed" is every player, you included, whose
// speed isn't 4 as it resolves (rule 702.179e), dealt it all at once.
const ENTERS_TEXT = "When this enchantment enters, it deals 5 damage to up to one target creature or planeswalker.";
const SAC_TEXT = "{2}, Sacrifice this enchantment: It deals 2 damage to each player who doesn't have max speed.";

export default defineCard({
  name: "Outpace Oblivion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${ENTERS_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } },
      ],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "damage",
        amount: 2,
        who: "each-player",
        whoseIf: { kind: "speed", who: "that-player", atMost: 3 },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
