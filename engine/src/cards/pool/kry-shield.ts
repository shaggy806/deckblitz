import { defineCard } from "../define.js";

const TEXT =
  "{2}, {T}: Prevent all damage that would be dealt this turn by target creature you control. That creature gets +0/+X until end of turn, where X is its mana value.";

export default defineCard({
  name: "Kry Shield",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", by: { target: 0 } },
          { kind: "modify-pt", target: 0, power: 0, toughness: { manaValueOf: 0 }, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
