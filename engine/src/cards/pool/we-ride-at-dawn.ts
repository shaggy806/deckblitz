import { defineCard } from "../define.js";

const CONVOKE =
  "Legendary creature spells you cast have convoke. (Your creatures can help cast those spells. Each creature you tap while casting a legendary creature spell pays for {1} or one mana of that creature's color.)";
const ATTACK =
  "Whenever your commander attacks, create a 1/1 red Mercenary creature token with \"{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery.\"";

export default defineCard({
  name: "We Ride at Dawn",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${CONVOKE}\n${ATTACK}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { supertype: "legendary", type: "creature" }, convoke: true },
      text: CONVOKE,
    },
  ],
  triggered: [
    {
      // A commander you own, whoever controls it (the rulings).
      trigger: { on: "attacks", who: "any", filter: { isCommander: true, ownedBy: "you" } },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      text: ATTACK,
    },
  ],
});
