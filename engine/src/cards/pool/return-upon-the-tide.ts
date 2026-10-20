import { defineCard } from "../define.js";

export default defineCard({
  name: "Return Upon the Tide",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to the battlefield. If it's an Elf, create two 1/1 green Elf Warrior creature tokens.\nForetell {3}{B} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  // "If it's an Elf" asks the permanent it became (the ruling: checked once
  // it's on the battlefield), which is what `this-way` reads.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "put-onto-battlefield", filter: { subtype: "Elf" } },
        then: { kind: "create-token", token: "Elf Warrior Token", count: 2 },
      },
    ],
  },
  foretell: { cost: "{3}{B}" },
});
