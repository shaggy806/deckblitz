import { defineCard } from "../define.js";

export default defineCard({
  name: "Gilded Light",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain shroud until end of turn. (You can't be the target of spells or abilities.)\nCycling {2} ({2}, Discard this card: Draw a card.)",
  cycling: { cost: "{2}" },
  targets: [],
  effect: {
    kind: "timed-static",
    duration: "end-of-turn",
    text: "You have shroud until end of turn.",
    static: [{ affects: { scope: "self" }, playerKeywords: ["shroud"], text: "You have shroud." }],
  },
});
