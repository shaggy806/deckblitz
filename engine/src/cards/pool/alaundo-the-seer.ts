import { defineCard } from "../define.js";

// The exiled card gains only the last line of suspend, no upkeep: nothing but
// another activation takes a counter off it. A mana value of 0 gets no counter,
// so that card's cast never triggers. A card with suspend of its own is
// suspended as well, and has both triggers (rule 702.62b).
const TEXT =
  "{T}: Draw a card, then exile a card from your hand and put a number of time counters on it equal to its mana value. It gains \"When the last time counter is removed from this card, if it's exiled, you may cast it without paying its mana cost. If you cast a creature spell this way, it gains haste until end of turn.\" Then remove a time counter from each other card you own in exile.";

export default defineCard({
  name: "Alaundo the Seer",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Shaman"],
  power: 3,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "exile", unlinked: true, leftover: "stay" },
          { kind: "give-suspend", timeCounters: "mana-value", timeCast: true },
          { kind: "remove-time-counters-in-exile", amount: 1, exceptExiledThisWay: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
