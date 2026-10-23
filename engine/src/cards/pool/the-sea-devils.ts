import { defineCard } from "../define.js";

// EDHREC rank 17971.
// Makes Alien Salamander → "Alien Salamander Token".
// III is a delayed triggered ability for the rest of the turn (rule 603.7c)
// with a target of its own, chosen each time it triggers: any Salamander,
// whoever controls it, dealing combat damage to a player deals that much
// again to a creature that player controls.
const CHAPTER_I_II =
  "I, II — Create a 2/2 green Alien Salamander creature token with islandwalk. (It can't be blocked as long as defending player controls an Island.)";
const CHAPTER_III_BODY =
  "Until end of turn, whenever a Salamander deals combat damage to a player, it deals that much damage to target creature that player controls.";
const CHAPTER_III = `III — ${CHAPTER_III_BODY}`;

export default defineCard({
  name: "The Sea Devils",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: { kind: "create-token", token: "Alien Salamander Token", count: 1 },
      resolve: null,
      text: CHAPTER_I_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "deals-combat-damage-to-player", who: "any", filter: { subtype: "Salamander" } },
          targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
        },
        effect: { kind: "damage", target: 0, amount: { triggerValue: true }, from: "trigger-object" },
        text: "Whenever a Salamander deals combat damage to a player, it deals that much damage to target creature that player controls.",
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
