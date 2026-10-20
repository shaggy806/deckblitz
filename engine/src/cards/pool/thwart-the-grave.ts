import { defineCard } from "../define.js";

// EDHREC rank 8934.
//
// The party cost reduction is Deadly Alliance's. The two targets are two
// instances of "target" (rule 115.3), so one card could fill both — which
// returns it once, exactly what leaving the optional slot empty does; the
// second slot is `other` for that reason. Both return as one event.

export default defineCard({
  name: "Thwart the Grave",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "This spell costs {1} less to cast for each creature in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)\nReturn target creature card and up to one target Cleric, Rogue, Warrior, or Wizard creature card from your graveyard to the battlefield.",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { partySize: "you" },
  },
  targets: [
    { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
    {
      kind: "optional",
      of: {
        kind: "other",
        of: {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", subtypes: ["Cleric", "Rogue", "Warrior", "Wizard"] },
        },
        than: { slots: [0] },
      },
    },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "put-onto-battlefield", target: 1 },
    ],
  },
});
