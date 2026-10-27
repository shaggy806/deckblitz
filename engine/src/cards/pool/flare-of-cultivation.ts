import { defineCard } from "../define.js";

// Modern Horizons 3 (MH3). EDHREC rank 2206.
//
// "You may sacrifice a nontoken green creature rather than pay this spell's
// mana cost": an alternative cost (rule 118.9), the creature chosen as the
// cost is paid (601.2h). The search is Kodama's Reach's.

export default defineCard({
  name: "Flare of Cultivation",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You may sacrifice a nontoken green creature rather than pay this spell's mana cost.\nSearch your library for up to two basic land cards, reveal those cards, put one onto the battlefield tapped and the other into your hand, then shuffle.",
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "creature", colors: ["G"], token: false }, text: "a nontoken green creature" },
  },
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    min: 0,
    max: 2,
    destination: "battlefield",
    enterTapped: true,
    restDestination: "hand",
    reveal: true,
  },
});
