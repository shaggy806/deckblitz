import { defineCard } from "../define.js";

// EDHREC rank 7647.
//
// Rakdos Joins Up's reanimation, as a sorcery.
export default defineCard({
  name: "Evil Reawakened",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to the battlefield with two additional +1/+1 counters on it.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "+1/+1", amount: 2 } },
});
