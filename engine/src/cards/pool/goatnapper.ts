import { defineCard } from "../define.js";

export default defineCard({
  name: "Goatnapper",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, untap target Goat and gain control of it until end of turn. It gains haste until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // "Target Goat": any permanent with the Goat creature type, changelings
      // included (the ruling).
      targets: [{ kind: "permanent", filter: { subtype: "Goat" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this creature enters, untap target Goat and gain control of it until end of turn. It gains haste until end of turn.",
    },
  ],
});
