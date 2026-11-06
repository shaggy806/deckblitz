import type { TriggerSpec } from "../../abilities.js";
import { defineCard } from "../define.js";
import { ASSIMILATE } from "../helpers.js";

// Assimilate (Star Trek): the card the opponent exiles goes onto the
// battlefield under your control with a +1/+1 counter, a Borg artifact
// creature with no other creature types (`ASSIMILATE`, rule 205.1b).
const ANTHEM = "Artifact creatures you control get +2/+2.";
const TRIGGER_TEXT =
  "Whenever The Borg Queen enters or attacks, target opponent exiles cards from the top of their library until they exile a creature card. Assimilate that card. They put the rest on the bottom in a random order. (To assimilate a card, put it onto the battlefield under your control with a +1/+1 counter. It's a Borg artifact creature and loses all other creature types.)";

const assimilateTheirs = (trigger: TriggerSpec) => ({
  trigger,
  targets: ["opponent" as const],
  effect: {
    kind: "reveal-until" as const,
    whose: 0,
    filter: { type: "creature" as const },
    exile: true,
    then: { kind: "put-onto-battlefield" as const, target: 0, underYourControl: true, ...ASSIMILATE },
    rest: "bottom-random" as const,
  },
  resolve: null,
  text: TRIGGER_TEXT,
});

export default defineCard({
  name: "The Borg Queen",
  manaCost: "{4}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Borg", "Noble"],
  power: 4,
  toughness: 4,
  text: `${ANTHEM}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantPt: [2, 2],
      text: ANTHEM,
    },
  ],
  triggered: [
    assimilateTheirs({ on: "enters-battlefield", who: "self" }),
    assimilateTheirs({ on: "attacks", who: "self" }),
  ],
});
