import { defineCard } from "../define.js";

// Modern Horizons 3 (MH3). EDHREC rank 1302.
//
// "You may sacrifice a nontoken black creature rather than pay this spell's
// mana cost": an alternative cost (rule 118.9), the creature chosen as the
// cost is paid (601.2h). The edict is Soul Shatter's: each opponent chooses
// among their own tied greatest (ruling).

export default defineCard({
  name: "Flare of Malice",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "You may sacrifice a nontoken black creature rather than pay this spell's mana cost.\nEach opponent sacrifices a creature or planeswalker with the greatest mana value among creatures and planeswalkers they control.",
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "creature", colors: ["B"], token: false }, text: "a nontoken black creature" },
  },
  effect: {
    kind: "sacrifice",
    who: "each-opponent",
    filter: {
      typesAnyOf: ["creature", "planeswalker"],
      greatestAmongItsController: { of: "mana-value", among: { typesAnyOf: ["creature", "planeswalker"] } },
    },
    count: 1,
  },
});
