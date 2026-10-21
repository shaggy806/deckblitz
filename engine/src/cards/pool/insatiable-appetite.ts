import { defineCard } from "../define.js";

export default defineCard({
  name: "Insatiable Appetite",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You may sacrifice a Food. If you do, target creature gets +5/+5 until end of turn. Otherwise, that creature gets +3/+3 until end of turn.",
  targets: ["creature"],
  // Whether to sacrifice is chosen as it resolves (its ruling); any Food
  // artifact counts, not only a token.
  effect: {
    kind: "each-player-may",
    who: "you",
    options: [{ sacrifice: { type: "artifact", subtype: "Food" }, text: "Sacrifice a Food" }],
    ifDid: { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" },
    ifDidnt: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
  },
});
