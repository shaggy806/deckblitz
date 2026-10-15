import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, exile up to one target card from a graveyard. Target creature you control connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)";

export default defineCard({
  name: "Mechanical Mobster",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Robot", "Villain"],
  power: 2,
  toughness: 1,
  text: ENTER_TEXT,
  triggered: [
    {
      // Heritage Reclamation's optional graveyard slot, then a targeted
      // connive (Change of Plans) — the Mobster itself may be the one.
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }, "creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "connive", target: 1 },
        ],
      },
      resolve: null,
      text: "When this creature enters, exile up to one target card from a graveyard. Target creature you control connives.",
    },
  ],
});
