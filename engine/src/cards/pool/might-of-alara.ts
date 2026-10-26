import { defineCard } from "../define.js";

// Conflux (CON). Domain, counted as it resolves.

export default defineCard({
  name: "Might of Alara",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Domain — Target creature gets +1/+1 until end of turn for each basic land type among lands you control.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { basicLandTypes: "you" },
    toughness: { basicLandTypes: "you" },
    duration: "end-of-turn",
  },
});
