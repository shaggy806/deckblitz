import { defineCard } from "../define.js";

// The creature cards are exiled with this creature (rule 607.2a), this stint
// of it only; it has their activated abilities — not triggered or static ones
// — for as long as they stay exiled, an ability naming its card meaning this
// creature, and only a double-faced card's front face's (the rulings). A
// target gone by resolution means no exile and no counter (rule 608.2b).
const EXILE_TEXT =
  "{2}{U}: Exile target creature card from your graveyard and put a +1/+1 counter on this creature.";
const GRANT_TEXT = "This creature has all activated abilities of all creature cards exiled with it.";

export default defineCard({
  name: "Patchwork Crawler",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 1,
  toughness: 2,
  text: `${EXILE_TEXT}\n${GRANT_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
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
      grantsActivatedOfLinkedExile: true,
      text: GRANT_TEXT,
    },
  ],
});
