import { defineCard } from "../define.js";

export default defineCard({
  name: "Hellion Crucible",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}{R}, {T}: Put a pressure counter on this land.\n{1}{R}, {T}, Remove two pressure counters from this land and sacrifice it: Create a 4/4 red Hellion creature token with haste. (It can attack and {T} as soon as it comes under your control.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "pressure", amount: 1 },
      resolve: null,
      text: "{1}{R}, {T}: Put a pressure counter on this land.",
    },
    {
      cost: { mana: "{1}{R}", tap: true, removeCounter: { kind: "pressure", count: 2 }, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Hellion Token (Haste)", count: 1 },
      resolve: null,
      text: "{1}{R}, {T}, Remove two pressure counters from this land and sacrifice it: Create a 4/4 red Hellion creature token with haste.",
    },
  ],
});
