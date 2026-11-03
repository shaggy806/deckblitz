import { defineCard } from "../define.js";

const SURVIVAL =
  "Survival — At the beginning of your second main phase, if Rip is tapped, reveal the top X cards of your library, where X is its power. Put any number of creature and/or Vehicle cards with different powers from among them into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Rip, Spawn Hunter",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 4,
  toughness: 4,
  text: SURVIVAL,
  triggered: [
    {
      // Survival (Cynical Loner's shape): the second main phase only, and an
      // intervening-if on Rip being tapped.
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "source", filter: { tapped: true } },
        ],
      },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { powerOf: "source" },
        reveal: true,
        min: 0,
        max: 99,
        filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
        together: { distinctPowers: true },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: SURVIVAL,
    },
  ],
});
