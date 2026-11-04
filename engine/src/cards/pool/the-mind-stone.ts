import { defineCard } from "../define.js";
import { infinity, manaTapAbility } from "../helpers.js";

const HARNESS = "{5}{W}, {T}: Harness The Mind Stone.";
const ABILITY =
  "At the beginning of your end step, exile up to one other target nonland permanent you control, then return that card to the battlefield under its owner's control.";
const INFINITY = `∞ — ${ABILITY}`;

// Marvel Super Heroes (MSH). EDHREC rank 3584.
export default defineCard({
  name: "The Mind Stone",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Infinity", "Stone"],
  keywords: ["indestructible"],
  text: `Indestructible\n{T}: Add {W}.\n${HARNESS} (Once harnessed, its ∞ ability is active.)\n${INFINITY}`,
  activated: [
    manaTapAbility("W"),
    {
      cost: { mana: "{5}{W}", tap: true },
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
          trigger: { on: "step-begins", step: "end", who: "you" },
          targets: [{ kind: "optional", of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } } } }],
          effect: { kind: "flicker", target: 0 },
          resolve: null,
          text: ABILITY,
        },
      ],
      text: INFINITY,
    }),
  ],
});
