import { defineCard } from "../define.js";
import { powerUp } from "../helpers.js";

// EDHREC rank 12831. Marvel Super Heroes.
//
// Once per card drawn (`draws`), with "if you control another Hero" an
// intervening-if (rule 603.4) that leaves Human Torch himself out — checked
// as it triggers and again as it resolves. Power-up is Aerial Doombot's.
const DRAW_TEXT =
  "Whenever you draw a card, if you control another Hero, Human Torch deals 1 damage to target opponent.";
const POWER_UP_TEXT =
  "Power-up — {6}{R}: Put three +1/+1 counters on Human Torch. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)";

export default defineCard({
  name: "Human Torch, Johnny Storm",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DRAW_TEXT}\n${POWER_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      condition: { kind: "controls", filter: { subtype: "Hero" }, atLeast: 1, excludeSelf: true },
      targets: ["opponent"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [powerUp("{6}{R}", { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 }, POWER_UP_TEXT)],
});
