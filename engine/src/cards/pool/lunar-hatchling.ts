import { defineCard } from "../define.js";

// EDHREC rank 17520.
// The escape cost's "Exile a land you control" is `escape.also`: one land
// chosen as the cost is paid, once the spell is on the stack (601.2h).
export default defineCard({
  name: "Lunar Hatchling",
  manaCost: "{4}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Alien", "Beast"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text:
    "Flying, trample\n" +
    "Basic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)\n" +
    "Escape—{4}{G}{U}, Exile a land you control, Exile five other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  escape: {
    cost: "{4}{G}{U}",
    exileCount: 5,
    also: {
      text: "Exile a land you control",
      do: {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "exile", target: 0 },
        prompt: "Exile a land you control",
      },
    },
  },
});
