import { defineCard } from "../define.js";

export default defineCard({
  name: "April O'Neil, Kunoichi Trainee",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 2,
  toughness: 2,
  text: "When April O'Neil enters, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)\nApril O'Neil can't be blocked by creatures with power 3 or greater.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "When April O'Neil enters, scry 2.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gte", n: 3 } },
      text: "April O'Neil can't be blocked by creatures with power 3 or greater.",
    },
  ],
});
