import { defineCard } from "../define.js";

// Rulings:
//   For the last ability, none of the chosen creatures are targets of the ability. You may choose
//   creatures with shroud, for example.

const MANA_TEXT = "{T}, Pay 1 life: Add {B} or {R}.";
const PING_TEXT = "{1}{B}{R}, {T}: Mount Doom deals 1 damage to each opponent.";
const DOOM_TEXT =
  "{5}{B}{R}, {T}, Sacrifice Mount Doom and a legendary artifact: Choose up to two creatures, then destroy the rest. Activate only as a sorcery.";

export default defineCard({
  name: "Mount Doom",
  supertypes: ["legendary"],
  types: ["land"],
  text: `${MANA_TEXT}\n${PING_TEXT}\n${DOOM_TEXT}`,
  activated: [
    ...(["B", "R"] as const).map((mana) => ({
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [],
      effect: { kind: "add-mana" as const, mana, amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    })),
    {
      cost: { mana: "{1}{B}{R}", tap: true },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: PING_TEXT,
    },
    {
      cost: {
        mana: "{5}{B}{R}",
        tap: true,
        sacrifice: { each: [{ isSource: true }, { type: "artifact", supertype: "legendary" }] },
      },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", choose: true, who: "you", for: { permanent: { type: "creature" }, upTo: 2, keep: true } },
          { kind: "destroy-all", filter: { type: "creature", notThisWay: "chosen" } },
        ],
      },
      resolve: null,
      text: DOOM_TEXT,
    },
  ],
});
