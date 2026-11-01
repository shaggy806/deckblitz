import { defineCard } from "../define.js";

// Two creatures sharing no creature type (`shares` with `none`) — one
// player's may be both (the ruling). Made to share one before it resolves,
// both are illegal and it doesn't resolve; one gone, the other deals and is
// dealt no damage (the rulings; rules 608.2b, 701.14b).
export default defineCard({
  name: "Rivals' Duel",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose two target creatures that share no creature types. Those creatures fight each other. (Each deals damage equal to its power to the other.)",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 }, shares: { kind: "creature", none: true } }],
  effect: { kind: "fight", a: 0, b: 1 },
});
