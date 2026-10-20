import { defineCard } from "../define.js";

// The Spirit from the Aura's own enters trigger makes the granted ability
// trigger, if the Aura is still on the battlefield by then (the ruling).
const GRANT_TEXT =
  "Enchanted creature has \"Whenever a creature you control enters, this creature gets +1/+1 until end of turn.\"";
const ETB_TEXT = "When this Aura enters, create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Nurturing Presence",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}\n${ETB_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: "Whenever a creature you control enters, this creature gets +1/+1 until end of turn.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
