import { defineCard } from "../define.js";

// EDHREC rank 19320. Marvel Super Heroes Commander.
//
// Squall, SeeD Mercenary's attacks-alone trigger, granting indestructible.
const TEXT = "Whenever a creature you control attacks alone, it gains indestructible until end of turn.";

export default defineCard({
  name: "Peggy Carter, Secret Agent",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 2,
  toughness: 1,
  text: `${TEXT} (Damage and effects that say "destroy" don't destroy it.)`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
