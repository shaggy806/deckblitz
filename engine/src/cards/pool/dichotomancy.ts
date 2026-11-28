import { defineCard } from "../define.js";

// EDHREC rank 29608.
//
// One search of the opponent's library, a slot for each tapped nonland
// permanent they control as it resolves (each token of a stack), each filled
// by at most one card of its name (`together: { oneEachSameNameAs: {
// onBattlefield } }`). The set is read inside an `as-player` of the target,
// so its "you" is that player; the searcher is still the spell's controller
// (`who: { controllerOf: "source" }`), the finds enter under their control,
// and the library's owner shuffles (rule 701.24a). A search for a card with a
// stated quality may find none (rule 701.23b).

export default defineCard({
  name: "Dichotomancy",
  manaCost: "{7}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "For each tapped nonland permanent target opponent controls, search that player's library for a card with the same name as that permanent. Put those cards onto the battlefield under your control, then that player shuffles.\nSuspend 3—{1}{U}{U}",
  suspend: { n: 3, cost: "{1}{U}{U}" },
  targets: ["opponent"],
  effect: {
    kind: "as-player",
    who: { target: 0 },
    effect: {
      kind: "search-library",
      who: { controllerOf: "source" },
      whose: "you",
      filter: {},
      destination: "battlefield",
      min: 0,
      max: 99,
      upTo: true,
      together: { oneEachSameNameAs: { onBattlefield: { tapped: true, notTypes: ["land"], controlledBy: "you" } } },
    },
  },
});
