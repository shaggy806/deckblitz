import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 12382.
//
// Once per card (not batched), that card the trigger object: exiled only
// while it's still that card in that graveyard (rule 400.7). Tokens aren't
// cards and never trigger it. The card does reach the graveyard first, so
// other graveyard triggers see it (the ruling). Planar Void itself, and
// cards going to the graveyard along with it, aren't seen — the trigger
// doesn't look back from the graveyard (the 2008 ruling).

const TEXT = "Whenever another card is put into a graveyard from anywhere, exile that card.";

export default defineCard({
  name: "Planar Void",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "any" },
      targets: [],
      effect: { kind: "exile", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
