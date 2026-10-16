import { defineCard } from "../define.js";

// EDHREC rank 14409. Act of Treason behind an "or" checked as the ability
// resolves: any creature can be targeted, and whether anything happens
// depends on its power then, or on another Lizard you control then (the
// ruling).
const TEXT =
  "When this creature enters, choose target creature. If that creature's power is 2 or less or if you control another Lizard, gain control of that creature until end of turn, untap it, and it gains haste until end of turn.";

export default defineCard({
  name: "Reptilian Recruiter",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 4,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: {
          kind: "any",
          of: [
            { kind: "target", index: 0, filter: { power: { op: "lte", n: 2 } } },
            { kind: "controls", filter: { subtype: "Lizard" }, atLeast: 1, excludeSelf: true },
          ],
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "gain-control", target: 0, untilEndOfTurn: true },
            { kind: "untap", target: 0 },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
