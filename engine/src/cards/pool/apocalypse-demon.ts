import { defineCard } from "../define.js";

// EDHREC rank 15726.
//
// Rulings:
//   The ability that defines Apocalypse Demon's power and toughness works in
//   all zones, not just the battlefield.
//
// Bloodsworn Knight's CDA over every card in your graveyard; Heavyweight
// Demolisher's upkeep "tap unless", its option a sacrifice of another
// creature (Bloodmist Infiltrator's).

const UPKEEP = "At the beginning of your upkeep, tap this creature unless you sacrifice another creature.";

export default defineCard({
  name: "Apocalypse Demon",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\nApocalypse Demon's power and toughness are each equal to the number of cards in your graveyard.\n${UPKEEP}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countInGraveyard: { ownedBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: "Apocalypse Demon's power and toughness are each equal to the number of cards in your graveyard.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        otherwise: { kind: "tap", target: "source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
