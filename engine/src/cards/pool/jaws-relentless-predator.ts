import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// No rulings.
//
// "Whenever a noncreature artifact is sacrificed or destroyed" is one ability
// written as two triggers over the two events: a permanent is sacrificed
// (rule 701.21a) or destroyed (701.8), never both, so each artifact fires
// exactly one of them. Anyone's artifact, read as it last existed on the
// battlefield (603.10a) — an artifact that was a creature as it left (an
// animated Vehicle, a crewed one) isn't "noncreature".
const BLOOD_TEXT =
  "Whenever Jaws deals combat damage to a player, create that many Blood tokens. (They're artifacts with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")";
const PING_TEXT = "Whenever a noncreature artifact is sacrificed or destroyed, Jaws deals 1 damage to each opponent.";

const NONCREATURE_ARTIFACT = { type: "artifact", notTypes: ["creature"] } as const;

const ping = (trigger: TriggeredAbility["trigger"]): TriggeredAbility => ({
  trigger,
  targets: [],
  effect: { kind: "damage", amount: 1, who: "each-opponent" },
  resolve: null,
  text: PING_TEXT,
});

export default defineCard({
  name: "Jaws, Relentless Predator",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shark"],
  power: 5,
  toughness: 5,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${BLOOD_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: { triggerValue: true } },
      resolve: null,
      text: BLOOD_TEXT,
    },
    ping({ on: "sacrifice", who: "any", filter: NONCREATURE_ARTIFACT }),
    ping({ on: "destroyed", who: "any", filter: NONCREATURE_ARTIFACT }),
  ],
});
