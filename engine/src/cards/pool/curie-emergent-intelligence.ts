import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 4473.
const DRAW_TEXT = "Whenever Curie deals combat damage to a player, draw cards equal to its base power.";
const GAINED_TEXT = "Whenever this creature deals combat damage to a player, draw cards equal to its base power.";
const COPY_TEXT = `{1}{U}, Exile another nontoken artifact creature you control: Curie becomes a copy of the exiled creature, except it has "${GAINED_TEXT}"`;

/** "Draw cards equal to its base power" (rule 613.4b): power set in layer 7b
 * or before, nothing that only modifies it — read as Curie last existed on
 * the battlefield if it has left (the rulings). */
const drawByBasePower = (text: string): TriggeredAbility => ({
  trigger: { on: "deals-combat-damage-to-player", who: "self" },
  targets: [],
  effect: { kind: "draw", amount: { basePowerOf: "source" } },
  resolve: null,
  text,
});

/**
 * Curie, Emergent Intelligence. The exile is a cost (`exilesSacrifice`), so
 * "the exiled creature" is the permanent as it last existed (rule 608.2h —
 * its ruling: a creature that was copying something gives that copy), read
 * as `{ paid: "sacrificed" }`. Its copy has the draw trigger as a copy
 * exception (707.9a), so it's copiable, and nothing of the original's tapped
 * state, counters or non-copy effects comes with it (the ruling); the copy
 * keeps its activated ability only if the exiled creature had one.
 */
export default defineCard({
  name: "Curie, Emergent Intelligence",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 1,
  toughness: 3,
  text: `${DRAW_TEXT}\n${COPY_TEXT}`,
  triggered: [drawByBasePower(DRAW_TEXT)],
  activated: [
    {
      cost: {
        mana: "{1}{U}",
        tap: false,
        sacrifice: { filter: { types: ["artifact", "creature"], token: false, isSource: false } },
        exilesSacrifice: true,
      },
      targets: [],
      effect: {
        kind: "become-copy",
        target: "source",
        of: { paid: "sacrificed" },
        exceptions: { triggered: [drawByBasePower(GAINED_TEXT)] },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
