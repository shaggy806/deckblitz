import { defineCard } from "../define.js";

// EDHREC rank 12771.
//
// Rulings:
//   [2020-04-17] You can cycle a card even if it has a triggered ability from cycling that won't
//     have a legal target. This is because the cycling ability and the triggered ability are
//     separate. This also means that if either ability is countered (with Disallow, for example),
//     the other ability will still resolve.
//   [2020-04-17] Some cards with cycling have an ability that triggers when you cycle them, and
//     some cards have an ability that triggers whenever you cycle any card. These triggered
//     abilities resolve before you draw from the cycling ability.
//   [2020-04-17] Triggered abilities from cycling a card and the cycling ability itself aren't
//     spells. Effects that interact with spells (such as that of Cancel) won't affect them.
// "For the first time each turn" is the timing wrapper, counted from the
// journal's `cycled` entries: a card cycled earlier this turn counts even if
// this creature wasn't on the battlefield yet.
const CYCLE_TEXT =
  "Whenever you cycle another card for the first time each turn, create a 1/1 white Human Soldier creature token.";

export default defineCard({
  name: "Valiant Rescuer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 1,
  cycling: { cost: "{2}" },
  text: `${CYCLE_TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "cycles", who: "you", otherOnly: true, firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
