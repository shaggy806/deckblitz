import { defineCard } from "../define.js";

// Final Fantasy. The target is chosen as the reflexive ability goes on the
// stack, after the spell is done (rule 603.12): `thisWay` fixes the cards the
// spell exiled as it triggers. The token copies the printed card with {X} as 0
// and is an artifact instead of its other types (the rulings).
const WHEN =
  "When you do, choose up to one target creature card exiled this way. Create a token that's a copy of that card, except it's an artifact and it loses all other card types.";

export default defineCard({
  name: "Espers to Magicite",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Exile each opponent's graveyard. ${WHEN}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: "each-opponent" },
      {
        kind: "reflexive-trigger",
        targets: [{ kind: "optional", of: { kind: "card-in-exile", thisWay: "exiled", filter: { type: "creature" } } }],
        effect: { kind: "create-token-copy", of: 0, count: 1, who: "you", exceptions: { setTypes: ["artifact"] } },
        text: WHEN,
      },
    ],
  },
});
