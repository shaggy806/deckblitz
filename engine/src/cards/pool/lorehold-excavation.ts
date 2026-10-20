import { defineCard } from "../define.js";

// EDHREC rank 18074.

const END_STEP_TEXT =
  "At the beginning of your end step, mill a card. If a land card was milled this way, you gain 1 life. Otherwise, this enchantment deals 1 damage to each opponent.";
const ACTIVATED_TEXT =
  "{5}, Exile a creature card from your graveyard: Create a tapped 3/2 red and white Spirit creature token.";

export default defineCard({
  name: "Lorehold Excavation",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  text: `${END_STEP_TEXT} (To mill a card, put the top card of your library into your graveyard.)\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      // Nothing milled (an empty library) is "otherwise": the damage.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: { type: "land" } },
            then: { kind: "gain-life", amount: 1 },
            else: { kind: "damage", amount: 1, who: "each-opponent" },
          },
        ],
      },
      resolve: null,
      text: END_STEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Red-White)", count: 1, tapped: true },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
