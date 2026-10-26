import { defineCard } from "../define.js";

export default defineCard({
  name: "Trostani's Judgment",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target creature, then populate. (Create a token that's a copy of a creature token you control.)",
  targets: ["creature"],
  effect: { kind: "sequence", effects: [{ kind: "exile", target: 0 }, { kind: "populate" }] },
});
