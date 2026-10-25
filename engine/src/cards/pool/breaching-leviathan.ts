import { defineCard } from "../define.js";

// EDHREC rank 10323.
// Every nonblue creature, yours too. The skipped untap tracks the creature,
// not its controller: one that changes hands skips its new controller's next
// untap step instead (the rulings — `tap-all`'s `doesntUntapNext` marks the
// object itself).
const ENTER_TEXT =
  "When this creature enters, if you cast it from your hand, tap all nonblue creatures. Those creatures don't untap during their controllers' next untap steps.";

export default defineCard({
  name: "Breaching Leviathan",
  manaCost: "{7}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 9,
  toughness: 9,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: {
        kind: "tap-all",
        filter: { type: "creature", notColors: ["U"] },
        doesntUntapNext: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
