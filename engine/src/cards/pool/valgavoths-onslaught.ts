import { defineCard } from "../define.js";

// Duskmourn: House of Horror. X is read once as it resolves; each manifest
// dread is finished (its card chosen, the other milled) before the next look
// (rule 701.62a). "Each of those creatures" is every permanent this
// resolution put onto the battlefield and still there — only the manifested
// cards (rule 701.40a), though one turned face up since is still one of them.
const TEXT =
  "Manifest dread X times, then put X +1/+1 counters on each of those creatures. (To manifest dread, look at the top two cards of your library, then put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Valgavoth's Onslaught",
  manaCost: "{X}{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "manifest-dread", count: "x" },
      { kind: "add-counter-all", filter: { thisWay: "put-onto-battlefield" }, counter: "+1/+1", amount: "x" },
    ],
  },
});
