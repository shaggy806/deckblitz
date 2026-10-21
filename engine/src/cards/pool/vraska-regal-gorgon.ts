import { defineCard } from "../define.js";

// EDHREC rank 19326.
//
// The −10 counts creature cards in your graveyard as it resolves, then puts
// that many +1/+1 counters on each creature you control (Undergrowth's count).

export default defineCard({
  name: "Vraska, Regal Gorgon",
  manaCost: "{5}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vraska"],
  loyalty: 5,
  text: "+2: Put a +1/+1 counter on up to one target creature. That creature gains menace until end of turn.\n−3: Destroy target creature.\n−10: For each creature card in your graveyard, put a +1/+1 counter on each creature you control.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "+2: Put a +1/+1 counter on up to one target creature. That creature gains menace until end of turn.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "−3: Destroy target creature.",
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: { countInGraveyard: { type: "creature", ownedBy: "you" } },
      },
      resolve: null,
      text: "−10: For each creature card in your graveyard, put a +1/+1 counter on each creature you control.",
    },
  ],
});
