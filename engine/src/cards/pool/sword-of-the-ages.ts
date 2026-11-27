import { defineCard } from "../define.js";

// "Sacrifice this artifact and any number of creatures you control": a cost
// of two parts, the second any number (Emrakul's Evangel's shape). X is the
// total power of the creatures as they last existed on the battlefield (rule
// 608.2h); a non-creature Sword has no power, so the whole set's sum is the
// creatures'. "Then exile this artifact and those creature cards": every card
// the cost put into a graveyard, still there (rule 400.7j), all at once.
export default defineCard({
  name: "Sword of the Ages",
  manaCost: "{6}",
  types: ["artifact"],
  text:
    "This artifact enters tapped.\n{T}, Sacrifice this artifact and any number of creatures you control: This artifact deals X damage to any target, where X is the total power of the creatures sacrificed this way, then exile this artifact and those creature cards.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        sacrifice: {
          parts: [
            { filter: { isSource: true }, count: 1 },
            { filter: { type: "creature", isSource: false }, count: "x" },
          ],
        },
      },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", target: 0, amount: { aggregate: "sum", of: "power", filter: {}, in: { paid: "sacrificed" } } },
          { kind: "exile", target: { paid: "sacrificed" } },
        ],
      },
      resolve: null,
      text:
        "{T}, Sacrifice this artifact and any number of creatures you control: This artifact deals X damage to any target, where X is the total power of the creatures sacrificed this way, then exile this artifact and those creature cards.",
    },
  ],
});
