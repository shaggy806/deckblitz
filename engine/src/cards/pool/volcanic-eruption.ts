import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 28701.
//
// By Force's X targets (X may be 0 — the ruling), destroyed as one event; the
// damage counts only the Mountains that went to a graveyard (`thisWay:
// "died"` — destroyed *and* put into a graveyard, so a regenerated or
// indestructible one, or one exiled instead, isn't counted), dealt to every
// creature and player at once.
const DAMAGE = { thisWay: "died" } as const;

export default defineCard({
  name: "Volcanic Eruption",
  manaCost: "{X}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Destroy X target Mountains. Volcanic Eruption deals damage to each creature and each player equal to the number of Mountains put into a graveyard this way.",
  targets: [{ kind: "any-number", of: { kind: "permanent", filter: { subtype: "Mountain" } }, min: "x", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: DAMAGE },
          { kind: "damage", amount: DAMAGE, who: "each-player" },
        ],
      },
    ],
  },
});
