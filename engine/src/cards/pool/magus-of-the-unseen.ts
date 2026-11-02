import { defineCard } from "../define.js";

const TEXT =
  "{1}{U}, {T}: Untap target artifact an opponent controls and gain control of it until end of turn. It gains haste until end of turn. When you lose control of the artifact, tap it.";

export default defineCard({
  name: "Magus of the Unseen",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "artifact" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: { losesControl: 0 },
            effect: { kind: "tap", target: 0 },
            text: "When you lose control of the artifact, tap it.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
