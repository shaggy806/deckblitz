import { defineCard } from "../define.js";

// EDHREC rank 13566.
//
// Rulings:
//   [2022-10-14] The last ability will trigger if you discard artifact cards for any reason, not
//     just due to its activated ability.
//
// The trigger isn't a mana ability (rule 605.1b: it doesn't trigger off a mana ability), so it
// uses the stack and its {R}{R} is added as it resolves.

const LOOT_TEXT = "{1}, {T}, Discard a card: Draw a card.";
const DISCARD_TEXT =
  "Whenever you discard one or more artifact cards, add {R}{R}. This ability triggers only once each turn.";

export default defineCard({
  name: "Mishra, Excavation Prodigy",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${LOOT_TEXT}\n${DISCARD_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "discards", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 2 },
      oncePerTurn: true,
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
