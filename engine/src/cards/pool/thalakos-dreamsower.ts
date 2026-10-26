import { defineCard } from "../define.js";

// EDHREC rank 25778. Any damage to an opponent, combat or not (Thieving Otter's trigger);
// the tap-and-lock is Phyrexian Gremlins' — it may target an already-tapped creature (the
// ruling), and the lock lasts while this creature stays tapped.

const DAMAGE_TEXT =
  "Whenever this creature deals damage to an opponent, tap target creature. That creature doesn't untap during its controller's untap step for as long as this creature remains tapped.";

export default defineCard({
  name: "Thalakos Dreamsower",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Thalakos", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\nYou may choose not to untap this creature during your untap step.\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      mayChooseNotToUntap: true,
      text: "You may choose not to untap this creature during your untap step.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
