import { defineCard } from "../define.js";

// EDHREC rank 6490.
//
// Rulings (2009-10-01):
//   If the enchanted creature's controller has a life total below 0, the
//   ability multiplies that number by two: at -4 life, it becomes -8.
//   At the time the ability triggers, determine which creature Celestial
//   Mantle is enchanting. As the ability resolves, determine who currently
//   controls that creature (or, if it's no longer on the battlefield, who
//   controlled it when it left). That's the player whose life total is
//   doubled.
//   If a player's life total is doubled, that player actually gains or loses
//   the necessary amount of life.
//
// The doubling is Beacon of Immortality's: the player's total becomes twice
// what it is, a gain or loss of the difference. The player is the damaging
// creature's controller as the ability resolves (`controllerOf`, as it last
// was once it has left), not the Aura's.

const BUFF_TEXT = "Enchanted creature gets +3/+3.";
const TRIGGER_TEXT =
  "Whenever enchanted creature deals combat damage to a player, double its controller's life total.";

export default defineCard({
  name: "Celestial Mantle",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${BUFF_TEXT}\n${TRIGGER_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: BUFF_TEXT }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: {
        kind: "as-player",
        who: { controllerOf: "trigger-object" },
        effect: { kind: "set-life-total", who: "you", amount: { product: [{ lifeTotal: "you" }, 2] } },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
