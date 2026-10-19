import { defineCard } from "../define.js";

// EDHREC rank 23055.
//
// "If that creature is a Cat" is asked as the ability resolves, of the target
// as it is then.

const TEXT =
  "{3}{W}: Put a +1/+1 counter on another target attacking creature you control. If that creature is a Cat, it gains first strike until end of turn.";

export default defineCard({
  name: "Ingenious Leonin",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 4,
  toughness: 4,
  text: `${TEXT} (It deals combat damage before creatures without first strike.)`,
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { subtype: "Cat" } },
            then: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
