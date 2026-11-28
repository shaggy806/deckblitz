import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 28423. Ice Age.
//
// "That card" is every card in a graveyard that died this turn as a creature
// this creature had dealt damage to, combat or not, however it died (the
// rulings): `putIntoGraveyardThisTurn`'s `asItLeft`, the card read as it last
// existed on the battlefield, damage record and all (603.10a). A card that has
// left the graveyard since is a new object (400.7) and is lost track of, even
// if it's back there. The intervening if (603.4) is asked again as it
// resolves, so a creature that dies in response comes back too (the ruling);
// all of them come back under the controller of the ability, together. A
// Vampire that has left the battlefield, or come back as a new object, dealt
// none of the damage: no trigger. Each card returned is sacrificed when you
// lose control of this creature (Seraph's watch, over all of them).

const DIED: CardFilter = {
  putIntoGraveyardThisTurn: {
    from: ["battlefield"],
    asItLeft: { type: "creature", damagedThisTurnBy: { source: "this" } },
  },
};

const TEXT =
  "At the beginning of each end step, if a creature dealt damage by this creature this turn died, put that card onto the battlefield under your control. Sacrifice it when you lose control of this creature.";

export default defineCard({
  name: "Krovikan Vampire",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "amounts", left: { countInGraveyard: DIED }, op: "gte", right: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-from-graveyard", from: "all-graveyards", filter: DIED, destination: "battlefield", count: "all" },
          {
            kind: "delayed-trigger",
            at: { losesControl: "source" },
            about: "put-onto-battlefield",
            effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "sacrifice-target", target: 0 } },
            text: "Sacrifice it when you lose control of this creature.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
