import { defineCard } from "../define.js";

// EDHREC rank 30312. Shards of Alara. The power is checked as it's targeted
// and as it resolves (the ruling: a target's legality); once applied, the
// shield lasts the turn whatever its power becomes.
const TEXT = "{1}{W}, {T}: Prevent all damage that would be dealt to target creature with power 5 or greater this turn.";

export default defineCard({
  name: "Godtoucher",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 5 } } }],
      effect: { kind: "prevent-damage", target: 0, amount: "all" },
      resolve: null,
      text: TEXT,
    },
  ],
});
