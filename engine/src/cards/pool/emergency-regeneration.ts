import { defineCard } from "../define.js";

export default defineCard({
  name: "Emergency Regeneration",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Artifacts you control gain hexproof and indestructible until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword-all", filter: { type: "artifact", controlledBy: "you" }, keyword: "hexproof", duration: "end-of-turn" },
      {
        kind: "grant-keyword-all",
        filter: { type: "artifact", controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
    ],
  },
});
