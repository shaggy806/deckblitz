import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const DIES =
  "When equipped creature dies, you may have this Equipment become a 2/1 Construct artifact creature with flying and ward {1}. If you do, it isn't an Equipment.";

export default defineCard({
  name: "Dancing Sword",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+1.\n${DIES}\nEquip {1}`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: "Equipped creature gets +2/+1." }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Dancing Sword become a 2/1 Construct artifact creature with flying and ward {1}?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "become",
              target: "source",
              power: 2,
              toughness: 1,
              setTypes: ["artifact", "creature"],
              setSubtypes: ["Construct"],
              keywords: ["flying"],
              duration: "permanent",
            },
            { kind: "become", target: "source", removeSubtypes: ["Equipment"], duration: "permanent" },
            { kind: "grant-triggered", target: "source", ability: ward({ mana: "{1}" }), duration: "permanent" },
          ],
        },
      },
      resolve: null,
      text: DIES,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
});
