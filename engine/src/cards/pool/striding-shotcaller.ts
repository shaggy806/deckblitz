import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 11280. Secrets of Strixhaven Commander. A preparation card
// (rule 722): its prepare spell is Run the Play, a spell with no card of its
// own (`prepareSpellOnly`). The damage trigger is batched — once per player
// dealt combat damage in one damage step; already prepared, it does nothing.
const PREPARE_TEXT =
  "Whenever one or more creatures you control deal combat damage to a player, this creature becomes prepared.";

export default defineCard({
  name: "Striding Shotcaller",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Troll", "Druid"],
  power: 0,
  toughness: 4,
  keywords: ["reach"],
  prepareSpell: "Run the Play",
  text: `Reach\n${PREPARE_TEXT} ${PREPARED_REMINDER}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: PREPARE_TEXT,
    },
  ],
});
