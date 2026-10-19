import { defineCard } from "../define.js";

// EDHREC rank 9852.

export default defineCard({
  name: "Venture Forth",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{1}{G}" },
  text: "Exile cards from the top of your library until you exile a land card. Put that card onto the battlefield and the rest on the bottom of your library in a random order. Exile Venture Forth with three time counters on it.\nSuspend 3—{1}{G}",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-until", filter: { type: "land" }, exile: true, put: "battlefield", rest: "bottom-random" },
      // Rory Williams' shape: the resolving spell itself, exiled suspended.
      { kind: "give-suspend", target: "source", timeCounters: 3 },
    ],
  },
});
