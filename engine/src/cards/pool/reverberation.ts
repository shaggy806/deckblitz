import { defineCard } from "../define.js";

export default defineCard({
  name: "Reverberation",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "All damage that would be dealt this turn by target sorcery spell is dealt to that spell's controller instead.",
  targets: [{ kind: "spell", filter: { type: "sorcery" } }],
  effect: { kind: "damage-rule", by: { target: 0 }, redirectTo: "source-controller" },
});
