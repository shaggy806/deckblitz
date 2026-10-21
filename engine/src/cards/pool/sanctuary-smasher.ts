import { defineCard } from "../define.js";

// EDHREC rank 19681. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] You can cycle a card even if it has a triggered ability from cycling that won't
//     have a legal target. This is because the cycling ability and the triggered ability are
//     separate. This also means that if either ability is countered (with Disallow, for example),
//     the other ability will still resolve.
//   [2020-04-17] Triggered abilities from cycling a card and the cycling ability itself aren't
//     spells. Effects that interact with spells (such as that of Cancel) won't affect them.
//   [2020-04-17] Some cards with cycling have an ability that triggers when you cycle them, and
//     some cards have an ability that triggers whenever you cycle any card. These triggered
//     abilities resolve before you draw from the cycling ability.

// Titanoth Rex's shape: a first strike counter is a keyword counter (rule 122.1b).
const CYCLE_TEXT = "When you cycle this card, put a first strike counter on target creature you control.";

export default defineCard({
  name: "Sanctuary Smasher",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Rhino", "Beast"],
  power: 6,
  toughness: 4,
  keywords: ["first-strike"],
  cycling: { cost: "{2}{R}" },
  text: `First strike\nCycling {2}{R} ({2}{R}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "first-strike", amount: 1 },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
