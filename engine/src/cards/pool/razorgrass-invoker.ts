import { defineCard } from "../define.js";

// EDHREC rank 26027. Lockjaw's "this and up to one other target creature":
// with no target it pumps itself alone; a target chosen that's illegal on
// resolution stops the whole ability, the +3/+3 to this creature too (the
// ruling, rule 608.2b).

const PUMP_TEXT = "{8}: This creature and up to one other target creature each get +3/+3 until end of turn.";

export default defineCard({
  name: "Razorgrass Invoker",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 4,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
