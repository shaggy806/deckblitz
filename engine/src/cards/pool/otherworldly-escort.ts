import { defineCard } from "../define.js";

// EDHREC rank 20573.
//
// The Enduring cycle's return, with its creature types replaced as it enters
// (`enterAs.setSubtypes` — a lasting effect of the resolution in layer 4, rule 611.2c,
// in place as it enters, rule 614.12, so "whenever a Spirit enters" sees one), four
// charge counters (`withCounters`). The intervening "if it's not a Spirit" (603.4) is
// judged as it last existed on the battlefield, so the returned Spirit Detective
// doesn't come back a second time. The activated ability is Spear of Heliod's
// target with a charge-counter cost.

const FLASH_TEXT = "Flash";
const DIES_TEXT =
  "When this creature dies, if it's not a Spirit, return it to the battlefield under its owner's control with four charge counters on it. It's a Spirit Detective. (It's no longer a Human.)";
const DESTROY_TEXT = "{1}{W}, {T}, Remove a charge counter from this creature: Destroy target creature that dealt damage to you this turn.";

export default defineCard({
  name: "Otherworldly Escort",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 4,
  toughness: 3,
  keywords: ["flash"],
  text: `${FLASH_TEXT}\n${DIES_TEXT}\n${DESTROY_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "source", filter: { notSubtypes: ["Spirit"] } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "charge", amount: 4 },
        enterAs: { setSubtypes: ["Spirit", "Detective"] },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", dealtDamageThisTurn: { to: "you" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
