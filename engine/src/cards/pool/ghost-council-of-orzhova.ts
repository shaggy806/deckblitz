import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 19176.
//
// Rulings:
//   [2006-02-01] Sacrificing Ghost Council of Orzhova to its own ability means it will wind up in
//     the graveyard, not exiled.
//   [2006-02-01] Normally, Ghost Council of Orzhova will return to the battlefield at the end of
//     the same turn it's exiled. But if it's exiled during the End step, it's too late to return
//     it this turn. It has to wait to return to the battlefield until the next End step.
//   [2006-02-01] When Ghost Council of Orzhova is exiled, any Auras or Equipment on it fall off
//     and any counters on it are removed. When it returns to the battlefield, it comes back
//     untapped and is treated as a new version of the card.

const ETB = "When Ghost Council of Orzhova enters, target opponent loses 1 life and you gain 1 life.";
const FLICKER =
  "{1}, Sacrifice a creature: Exile Ghost Council of Orzhova. Return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Ghost Council of Orzhova",
  manaCost: "{W}{W}{B}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: `${ETB}\n${FLICKER}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "flicker",
        target: "source",
        returnAt: "next-end-step",
        returnText: "Return Ghost Council of Orzhova to the battlefield under its owner's control.",
      },
      resolve: null,
      text: FLICKER,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      resolve: null,
      text: ETB,
    },
  ],
});
