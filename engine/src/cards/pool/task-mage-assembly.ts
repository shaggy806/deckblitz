import { defineCard } from "../define.js";

// EDHREC rank 28111. A state trigger (Mana Vortex's shape, over creatures),
// and an ability any player may activate as a sorcery (`anyPlayer` with
// `sorcerySpeed`).

const SAC_TEXT = "When there are no creatures on the battlefield, sacrifice this enchantment.";
const PING_TEXT =
  "{2}: This enchantment deals 1 damage to target creature. Any player may activate this ability but only as a sorcery.";

export default defineCard({
  name: "Task Mage Assembly",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${SAC_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "state",
        state: {
          kind: "all",
          of: [
            { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
            { kind: "not", of: { kind: "opponent-controls", filter: { type: "creature" }, atLeast: 1 } },
          ],
        },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      anyPlayer: true,
      sorcerySpeed: true,
      text: PING_TEXT,
    },
  ],
});
