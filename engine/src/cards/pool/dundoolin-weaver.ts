import { defineCard } from "../define.js";

// EDHREC rank 14551.
//
// Rulings:
//   [2025-11-17] If you don't control three or more creatures immediately after Dundoolin Weaver
//     enters, its ability won't trigger. If you don't control three or more creatures as the
//     ability tries to resolve, it won't resolve and none of its effects will happen. It doesn't
//     matter if any of the creatures you control when the ability resolves are the same creatures
//     as the ones you controlled when it triggered.

// An intervening "if" (rule 603.4), checked as it enters and again as it
// resolves; the Weaver counts itself.
const ENTER_TEXT =
  "When this creature enters, if you control three or more creatures, return target permanent card from your graveyard to your hand.";

export default defineCard({
  name: "Dundoolin Weaver",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kithkin", "Druid"],
  power: 2,
  toughness: 1,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { type: "creature" }, atLeast: 3 },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
