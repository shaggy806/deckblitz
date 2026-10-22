import { defineCard } from "../define.js";

// EDHREC rank 30356. No "until end of turn": the +2/+0 and flying last until
// it leaves. "Only once" is once for the life of this object, whoever
// controls it — `exhaust` (the 2008-10-01 ruling) — and "its controller"
// sacrifices it, whoever that is at the end step.
const TEXT =
  "{1}{R}: This creature gets +2/+0 and gains flying. Its controller sacrifices it at the beginning of the next end step. Activate only once and only if you control a snow Mountain.";

export default defineCard({
  name: "Goblin Ski Patrol",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "permanent" },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            text: "Its controller sacrifices Goblin Ski Patrol.",
            effect: { kind: "sacrifice-target", target: "source", byItsController: true },
          },
        ],
      },
      resolve: null,
      condition: { kind: "controls", filter: { subtype: "Mountain", supertype: "snow" }, atLeast: 1 },
      exhaust: true,
      text: TEXT,
    },
  ],
});
