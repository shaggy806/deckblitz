import { defineCard } from "../define.js";
import { PARLEY_NONLAND, parley } from "../helpers.js";

// Conspiracy (CNS). EDHREC rank 2114.
//
// Not a mana ability: it moves cards out of libraries (rule 605.1a; the
// ruling), so it uses the stack and can be answered, and can't be activated
// while paying a cost.
export default defineCard({
  name: "Selvala, Explorer Returned",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Elf", "Scout"],
  power: 2,
  toughness: 4,
  text: "Parley — {T}: Each player reveals the top card of their library. For each nonland card revealed this way, add {G} and you gain 1 life. Then each player draws a card. (Activate only as an instant.)",
  activated: [
    {
      cost: { mana: "", tap: true },
      targets: [],
      effect: parley(
        { kind: "add-mana", mana: "G", amount: PARLEY_NONLAND },
        { kind: "gain-life", amount: PARLEY_NONLAND },
      ),
      resolve: null,
      text: "Parley — {T}: Each player reveals the top card of their library. For each nonland card revealed this way, add {G} and you gain 1 life. Then each player draws a card.",
    },
  ],
});
