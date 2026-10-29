import { defineCard } from "../define.js";

export default defineCard({
  name: "Forfend",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to creatures this turn.",
  targets: [],
  effect: { kind: "damage-rule", to: { permanents: { type: "creature" } } },
});
