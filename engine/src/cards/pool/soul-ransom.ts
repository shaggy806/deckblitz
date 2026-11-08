import { defineCard } from "../define.js";

const RANSOM_TEXT =
  "Discard two cards: This Aura's controller sacrifices it, then draws two cards. Only your opponents may activate this ability.";

/** The activating opponent controls the ability (rule 602.2a), so the Aura's
 * controller is named with `as-player` — they sacrifice it and they draw,
 * drawing even if the Aura is gone already (its ruling). */
export default defineCard({
  name: "Soul Ransom",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nYou control enchanted creature.\n${RANSOM_TEXT}`,
  targets: ["creature"],
  controlEnchanted: true,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 2 } },
      targets: [],
      effect: {
        kind: "as-player",
        who: { controllerOf: "source" },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice-source" },
            { kind: "draw", amount: 2 },
          ],
        },
      },
      resolve: null,
      anyPlayer: true,
      onlyOpponents: true,
      text: RANSOM_TEXT,
    },
  ],
});
