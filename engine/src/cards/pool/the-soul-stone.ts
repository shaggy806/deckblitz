import { defineCard } from "../define.js";
import { infinity, manaTapAbility } from "../helpers.js";

const HARNESS = "{6}{B}, {T}, Exile a creature you control: Harness The Soul Stone.";
const ABILITY = "At the beginning of your upkeep, return target creature card from your graveyard to the battlefield.";
const INFINITY = `∞ — ${ABILITY}`;

// Marvel's Spider-Man (SPM). EDHREC rank 880.
export default defineCard({
  name: "The Soul Stone",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Infinity", "Stone"],
  keywords: ["indestructible"],
  text: `Indestructible\n{T}: Add {B}.\n${HARNESS} (Once harnessed, its ∞ ability is active.)\n${INFINITY}`,
  activated: [
    manaTapAbility("B"),
    {
      cost: { mana: "{6}{B}", tap: true, sacrifice: { filter: { type: "creature", controlledBy: "you" } }, exilesSacrifice: true },
      targets: [],
      effect: { kind: "harness" },
      resolve: null,
      text: HARNESS,
    },
  ],
  static: [
    infinity({
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
          effect: { kind: "put-onto-battlefield", target: 0 },
          resolve: null,
          text: ABILITY,
        },
      ],
      text: INFINITY,
    }),
  ],
});
