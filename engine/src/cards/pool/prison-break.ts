import { defineCard } from "../define.js";

export default defineCard({
  name: "Prison Break",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  mayhem: { cost: "{3}{B}" },
  text: "Return target creature card from your graveyard to the battlefield with an additional +1/+1 counter on it.\nMayhem {3}{B} (You may cast this card from your graveyard for {3}{B} if you discarded it this turn. Timing rules still apply.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "+1/+1", amount: 1 } },
});
