import { defineCard } from "../define.js";

// "Whenever you visit an Attraction": once per visit. The new creature is a
// target that must still be tapped as it resolves, or the Aura stays where
// it is (the ruling).
const ENTERS_TEXT = "When this Aura enters, tap enchanted creature.";
const UNTAP_TEXT = "Enchanted creature doesn't untap during its controller's untap step.";
const VISIT_TEXT = "Whenever you visit an Attraction, you may attach this Aura to target tapped creature.";

export default defineCard({
  name: "Motion Sickness",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS_TEXT}\n${UNTAP_TEXT}\n${VISIT_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, restrictions: ["doesnt-untap"], text: UNTAP_TEXT }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "event", event: "visited", who: "you" },
      targets: [{ kind: "permanent", filter: { type: "creature", tapped: true } }],
      effect: {
        kind: "may",
        prompt: "Attach Motion Sickness to the tapped creature?",
        effect: { kind: "attach", target: 0, attachment: "source" },
      },
      resolve: null,
      text: VISIT_TEXT,
    },
  ],
});
