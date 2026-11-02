import { defineCard } from "../define.js";

// "You may put … onto the battlefield. If it's a double-faced card, you may
// transform it" is two steps, not "enters transformed": it enters front face up,
// so its enter triggers see that face, then turns over. Choosing it is the "may",
// and a single-faced card (rule 701.27c: nothing would happen) is never offered.
const TEXT =
  "Power-up — {W}{U}{B}{R}{G}: Put two +1/+1 counters on Nick Fury, then look at the top seven cards of your library. You may put a Hero, Equipment, or Vehicle card from among them onto the battlefield. If it's a double-faced card, you may transform it. Put the rest on the bottom of your library in a random order. (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn.)";

export default defineCard({
  name: "Nick Fury, Agent of S.H.I.E.L.D.",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "library",
            count: 7,
            min: 0,
            max: 1,
            filter: { anyOf: [{ subtype: "Hero" }, { subtype: "Equipment" }, { subtype: "Vehicle" }] },
            destination: "battlefield",
            leftover: "bottom-random",
          },
          {
            kind: "choose-permanents",
            filter: { thisWay: "put-onto-battlefield", doubleFaced: true },
            upTo: 1,
            then: { kind: "transform", target: 0 },
            prompt: "You may transform it",
          },
        ],
      },
      resolve: null,
      text: TEXT,
      powerUp: true,
    },
  ],
});
