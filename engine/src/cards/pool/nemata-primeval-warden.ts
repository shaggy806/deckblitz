import { defineCard } from "../define.js";

// EDHREC rank 4854.
// Makes Saproling → use "Saproling Token".

export default defineCard({
  name: "Nemata, Primeval Warden",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach\nIf a creature an opponent controls would die, exile it instead. When you do, create a 1/1 green Saproling creature token.\n{G}, Sacrifice a Saproling: Nemata gets +2/+2 until end of turn.\n{1}{B}, Sacrifice two Saprolings: Draw a card.",
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: { filter: { subtype: "Saproling" } } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{G}, Sacrifice a Saproling: Nemata gets +2/+2 until end of turn.",
    },
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: { filter: { subtype: "Saproling" }, count: 2 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}{B}, Sacrifice two Saprolings: Draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", controlledBy: "opponent" },
        then: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "create-token", token: "Saproling Token", count: 1 },
          text: "When you do, create a 1/1 green Saproling creature token.",
        },
      },
      text: "If a creature an opponent controls would die, exile it instead. When you do, create a 1/1 green Saproling creature token.",
    },
  ],
});
