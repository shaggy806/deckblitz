import { defineCard } from "../define.js";

// EDHREC rank 19172.
//
// Rulings:
//   The set of creatures affected by Tenacity is determined as the spell resolves. Creatures you
//     begin to control later in the turn won't get +1/+1 or gain lifelink.
//
// Jeskai Ascendancy's shape: the pump, the grant and the untap all read the
// same filter in the one resolution, so "those creatures" is the same set.

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Tenacity",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +1/+1 and gain lifelink until end of turn. Untap those creatures. (Damage dealt by those creatures also causes you to gain that much life.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: YOURS, keyword: "lifelink", duration: "end-of-turn" },
      { kind: "untap-all", filter: YOURS },
    ],
  },
});
