import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const TUNNEL = "{4}, {T}: Two target creatures you control that share a creature type can't be blocked this turn.";

// The two share a creature type (`shares`). One gone before it resolves, the
// other still can't be blocked as long as it has a creature type the gone one
// had as it left (the ruling; rules 608.2b, 608.2h).
export default defineCard({
  name: "Secret Tunnel",
  types: ["land"],
  subtypes: ["Cave"],
  text: `This land can't be blocked.\n{T}: Add {C}.\n${TUNNEL}`,
  static: [{ affects: { scope: "self" }, grantKeywords: ["unblockable"], text: "This land can't be blocked." }],
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{4}", tap: true },
      targets: [
        "creature-you-control",
        { kind: "other", of: "creature-you-control", than: { slot: 0 }, shares: { kind: "creature" } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 1, keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TUNNEL,
    },
  ],
});
