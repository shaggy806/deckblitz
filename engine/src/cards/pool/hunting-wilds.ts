import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 8804. Kicked, the Forests it put onto the battlefield untap and
// become 3/3 green creatures for good (the ruling); "green" with no "in
// addition" sets their colour.

const SEARCH: EffectSpec = {
  kind: "search-library",
  filter: { type: "land", subtype: "Forest" },
  destination: "battlefield",
  min: 0,
  max: 2,
  enterTapped: true,
};

export default defineCard({
  name: "Hunting Wilds",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Kicker {3}{G} (You may pay an additional {3}{G} as you cast this spell.)\nSearch your library for up to two Forest cards, put them onto the battlefield tapped, then shuffle.\nIf this spell was kicked, untap all Forests put onto the battlefield this way. They become 3/3 green creatures with haste that are still lands.",
  targets: [],
  effect: SEARCH,
  kicker: {
    cost: "{3}{G}",
    effect: {
      kind: "sequence",
      effects: [
        SEARCH,
        { kind: "untap-all", filter: { thisWay: "put-onto-battlefield" } },
        {
          kind: "for-each-permanent",
          filter: { thisWay: "put-onto-battlefield" },
          as: 0,
          effect: {
            kind: "animate",
            target: 0,
            power: 3,
            toughness: 3,
            addTypes: ["creature"],
            addSubtypes: [],
            setColors: ["G"],
            keywords: ["haste"],
            duration: "permanent",
          },
        },
      ],
    },
  },
});
