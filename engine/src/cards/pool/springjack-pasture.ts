import { defineCard } from "../define.js";

// "Sacrifice X Goats" in a mana ability: no target and it adds mana, so it's a
// mana ability whatever else it does (rule 605.1a), and never on the stack
// (605.3b). X and the colour come with the activation, the Goats are chosen as
// the cost is paid, and the mana and the life come with the last one. It can be
// activated only with priority, by hand; the auto-payer never sacrifices for it.
export default defineCard({
  name: "Springjack Pasture",
  colors: [],
  types: ["land"],
  text:
    "{T}: Add {C}.\n" +
    "{4}, {T}: Create a 0/1 white Goat creature token.\n" +
    "{T}, Sacrifice X Goats: Add X mana of any one color. You gain X life.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Goat Token", count: 1 },
      resolve: null,
      text: "{4}, {T}: Create a 0/1 white Goat creature token.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Goat" }, count: "x" } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: "x", also: { kind: "gain-life", amount: "x" } },
      resolve: null,
      text: "{T}, Sacrifice X Goats: Add X mana of any one color. You gain X life.",
    },
  ],
});
