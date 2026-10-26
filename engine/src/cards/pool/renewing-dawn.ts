import { defineCard } from "../define.js";

// Portal (POR). EDHREC rank 31777. The Mountains are counted from the target
// opponent's side (`forTarget`) as the spell resolves.

export default defineCard({
  name: "Renewing Dawn",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You gain 2 life for each Mountain target opponent controls.",
  targets: ["opponent"],
  effect: {
    kind: "gain-life",
    amount: { countOf: { subtype: "Mountain", controlledBy: "you" }, forTarget: 0, times: 2 },
  },
});
