import { defineCard } from "../define.js";

// EDHREC rank 11328.
//
// The creature is exiled with this creature (rule 607.2a), this stint of it
// only; it has the activated abilities — not triggered or static ones — of
// the creature *cards* among them, for as long as they stay exiled: a
// permanent that was a creature only for a while (an animated land) is a land
// card in exile and gives nothing, and a double-faced card gives its front
// face's (the rulings). An ability naming its card means this creature (rule
// 201.5b). A token exiled ceases to exist (rule 111.7). A target gone by
// resolution means no exile and no counter (rule 608.2b).

const EXILE_TEXT = "{4}{B}{B}: Exile target creature and put a +1/+1 counter on this creature.";
const GRANT_TEXT = "This creature has all activated abilities of all creature cards exiled with it.";

export default defineCard({
  name: "Dark Impostor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Assassin"],
  power: 2,
  toughness: 2,
  text: `${EXILE_TEXT}\n${GRANT_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{B}{B}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, linked: true },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "exiled-with", filter: { type: "creature" } },
      text: GRANT_TEXT,
    },
  ],
});
