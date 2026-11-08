import { defineCard } from "../define.js";

const GRANTED =
  "{15}, Exile The Dominion Bracelet: You control target opponent during their next turn. This ability costs {X} less to activate, where X is this creature's power. Activate only as a sorcery.";

export default defineCard({
  name: "The Dominion Bracelet",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1 and has "${GRANTED}" (You see all cards that player could see and make all decisions for them.)\nEquip {1}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsActivated: [
        {
          cost: { mana: "{15}", tap: false, do: { kind: "exile", target: "granter" } },
          targets: ["opponent"],
          effect: { kind: "control-player", target: 0, during: "next-turn" },
          resolve: null,
          costReduction: { reduceGeneric: { powerOf: "source" } },
          sorcerySpeed: true,
          text: GRANTED,
        },
      ],
      text: "Equipped creature gets +1/+1 and has the bracelet's ability.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: "Equip {1}",
    },
  ],
});
