import { defineCard } from "../define.js";

// EDHREC rank 14078.
// Makes Goblin Army by amassing → the engine's "Army Token" (amass adds Goblin).
//
// "Whenever a creature card leaves your graveyard" is once per card, however
// many leave together (`perCard`), each judged as it was in the graveyard —
// its own enters ability returning one triggers it.
const ETB_TEXT = "When this enchantment enters, return target creature card from your graveyard to your hand.";
const AMASS_TEXT = "Whenever a creature card leaves your graveyard, amass Goblins 1.";
const MENACE_TEXT = "{1}{B}: Goblins and Orcs you control gain menace until end of turn.";

export default defineCard({
  name: "Along the Crooked Way",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text:
    `${ETB_TEXT}\n` +
    "Whenever a creature card leaves your graveyard, amass Goblins 1. (Put a +1/+1 counter on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)\n" +
    MENACE_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "leaves-graveyard", who: "you", perCard: true, filter: { type: "creature" } },
      targets: [],
      effect: { kind: "amass", amount: 1, creatureType: "Goblin" },
      resolve: null,
      text: AMASS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { subtypes: ["Goblin", "Orc"], controlledBy: "you" },
        keyword: "menace",
        duration: "end-of-turn",
      },
      resolve: null,
      text: MENACE_TEXT,
    },
  ],
});
