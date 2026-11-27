import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// "Hankyu" in the granted abilities is the Equipment granting them (rule
// 201.5a): the aim counter goes on it (`target: "granter"`, only while it's
// still that permanent — 400.7), and the second ability's cost takes every aim
// counter off it (`removeCounter.granter`, payable with none — rule 118.3 asks
// only what the cost names), the number removed being the ability's X (601.2h,
// via 602.2b). The counters stay on Hankyu when it moves to another creature.
// "This creature" is the one activating, the damage's source.

const AIM = "{T}: Put an aim counter on Hankyu";
const FIRE =
  "{T}, Remove all aim counters from Hankyu: This creature deals damage to any target equal to the number of aim counters removed this way.";
const GRANT_TEXT = `Equipped creature has "${AIM}" and "${FIRE}"`;

export default defineCard({
  name: "Hankyu",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${GRANT_TEXT}\nEquip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-counter", target: "granter", counter: "aim", amount: 1 },
          resolve: null,
          text: AIM,
        },
        {
          cost: { mana: null, tap: true, removeCounter: { kind: "aim", count: "all", granter: true } },
          targets: ["any-target"],
          effect: { kind: "damage", amount: "x", target: 0 },
          resolve: null,
          text: FIRE,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
