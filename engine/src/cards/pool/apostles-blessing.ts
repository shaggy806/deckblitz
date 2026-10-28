import { defineCard } from "../define.js";

// EDHREC rank 7565.

export default defineCard({
  name: "Apostle's Blessing",
  manaCost: "{1}{W/P}",
  colors: ["W"],
  types: ["instant"],
  text: "({W/P} can be paid with either {W} or 2 life.)\nTarget artifact or creature you control gains protection from artifacts or from the color of your choice until end of turn.",
  targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "grant-protection",
    target: 0,
    from: { choose: "color", or: [{ text: "artifacts", from: { types: ["artifact"] } }] },
    duration: "end-of-turn",
  },
});
