import { defineCard } from "../define.js";

const ANIMATE =
  '{U}{R}: Until end of turn, this land becomes a 2/1 blue and red Elemental creature with "During your turn, this creature has first strike." It\'s still a land.';

export default defineCard({
  name: "Restless Spire",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {U} or {R}.\n${ANIMATE}\nWhenever this land attacks, scry 1.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U} or {R}.",
    },
    {
      cost: { mana: "{U}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 2,
            toughness: 1,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            setColors: ["U", "R"],
            duration: "end-of-turn",
          },
          {
            kind: "grant-static",
            target: "source",
            ability: {
              affects: { scope: "self" },
              condition: { kind: "your-turn" },
              grantKeywords: ["first-strike"],
              text: "During your turn, this creature has first strike.",
            },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "Whenever this land attacks, scry 1.",
    },
  ],
});
