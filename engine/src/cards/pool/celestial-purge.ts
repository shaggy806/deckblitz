import { defineCard } from "../define.js";

// Conflux (CON). Colour is the permanent's current one, so a land (colourless)
// isn't a legal target unless something has made it black or red.

export default defineCard({
  name: "Celestial Purge",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target black or red permanent.",
  targets: [{ kind: "permanent", whose: "any", filter: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] } }],
  effect: { kind: "exile", target: 0 },
});
