import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { ASSIMILATE } from "../helpers.js";

const TEXT =
  "For each opponent, assimilate up to one target creature card from that player's graveyard that was put there from the battlefield this turn. (Put it onto the battlefield under your control with a +1/+1 counter. It's a Borg artifact creature and loses all other creature types.)";

// One optional slot per opponent seat (Sepulchral Primordial's shape); every
// card still a legal target is assimilated — all at once, the chooser taking
// them all (`min` = `max`).
const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: {
    kind: "card-in-graveyard",
    whose: { seat },
    filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
  },
});

export default defineCard({
  name: "Assimilate the Wounded",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
  effect: {
    kind: "look-and-choose",
    zone: "targets",
    min: 3,
    max: 3,
    destination: "battlefield",
    ...ASSIMILATE,
    leftover: "stay",
  },
});
