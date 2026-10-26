import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 20160.
//
// Rulings:
//   [2008-04-01] You choose a target for this spell as you cast it, but you don't choose a
//     creature type until the spell resolves.
//   [2008-04-01] Note that this spell counts the number of permanents you control of the chosen
//     type, not just the number of creatures you control. It will also take your kindred
//     permanents of the chosen type into account.

const COUNT = { countOf: { controlledBy: "you", subtype: CHOSEN_CREATURE_TYPE } } as const;

export default defineCard({
  name: "Pack's Disdain",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose a creature type. Target creature gets -1/-1 until end of turn for each permanent of the chosen type you control.",
  targets: ["creature"],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "modify-pt",
      target: 0,
      power: { product: [-1, COUNT] },
      toughness: { product: [-1, COUNT] },
      duration: "end-of-turn",
    },
  },
});
