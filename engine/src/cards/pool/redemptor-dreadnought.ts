import { defineCard } from "../define.js";

// EDHREC rank 17226. Exiled as the spell is cast, the card is linked to the
// permanent the spell becomes; a copy of it has no card exiled with it.
const PLASMA_TEXT =
  "Plasma Incinerator — Whenever this creature attacks, if a card is exiled with it, it gets +X/+X until end of turn, where X is the power of the exiled card.";

export default defineCard({
  name: "Redemptor Dreadnought",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Astartes", "Dreadnought"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Fallen Warrior — As an additional cost to cast this spell, you may exile a creature card from your graveyard.\nTrample\n${PLASMA_TEXT}`,
  additionalCost: { exileFromGraveyard: { count: 1, filter: { type: "creature" }, optional: true, linked: true } },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "exiled-with-source", atLeast: 1, now: true },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { aggregate: "sum", of: "power", filter: {}, in: "exiled-with-source" },
        toughness: { aggregate: "sum", of: "power", filter: {}, in: "exiled-with-source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: PLASMA_TEXT,
    },
  ],
});
