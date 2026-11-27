import { defineCard } from "../define.js";

// Ice Age. Its last ability triggers as the creature leaves; the Aura goes to
// its owner's graveyard in the state-based check after (704.5m), and the
// trigger returns it from there (Angelic Destiny's "source" read off a leaves
// trigger). "That creature's controller returns" it: it enters under that
// player's control (rule 110.2a), who chooses what it enchants as it enters
// (303.4f), and with nothing to enchant it stays in the graveyard (303.4g).
// Exiled instead (Rest in Peace), it isn't in the graveyard to return
// (`fromGraveyard`).
// A new object, it has no plague counters (the ruling).

const UPKEEP = "At the beginning of each upkeep, put a plague counter on this Aura.";
const SHRINK = "Enchanted creature gets -1/-1 for each plague counter on this Aura.";
const RETURN =
  "When enchanted creature leaves the battlefield, that creature's controller returns this Aura from its owner's graveyard to the battlefield.";

export default defineCard({
  name: "Traveling Plague",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UPKEEP}\n${SHRINK}\n${RETURN}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "plague", pt: [-1, -1] },
      text: SHRINK,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "plague", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "leaves-battlefield", who: "attached" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", fromGraveyard: true, under: { controllerOf: "trigger-object" } },
      resolve: null,
      text: RETURN,
    },
  ],
});
