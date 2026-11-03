import { defineCard } from "../define.js";

export default defineCard({
  name: "Broadcast Takeover",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of all artifacts your opponents control until end of turn. Untap them. They gain haste until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control-all", filter: { type: "artifact", controlledBy: "opponent" }, untilEndOfTurn: true },
      { kind: "untap-all", filter: { thisWay: "control-effect" } },
      { kind: "grant-keyword-all", filter: { thisWay: "control-effect" }, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
