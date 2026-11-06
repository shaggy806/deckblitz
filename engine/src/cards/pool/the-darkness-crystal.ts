import { defineCard } from "../define.js";

// Final Fantasy (FIN). EDHREC rank 1159.
//
// Rulings:
//   If The Darkness Crystal leaves the battlefield at the same time as one or more nontoken
//     creatures an opponent controls would die, those creature cards are exiled and you gain 2
//     life for each of them (the leave batch, as Kalitas's).
//   A creature token an opponent controls goes to its owner's graveyard as normal.
//   The cost reduction applies only to generic mana in the total cost of black spells you cast.
//
// The exile is part of the replacement, and so is the life (rule 614.1a): nothing on the stack.
// The card is exiled *with* the Crystal (rule 607.2a — the replacement's `linked`), so the last
// ability finds it; a card Rest in Peace could exile instead isn't linked (rule 616.1).
const DISCOUNT_TEXT = "Black spells you cast cost {1} less to cast.";
const REPLACE_TEXT = "If a nontoken creature an opponent controls would die, instead exile it and you gain 2 life.";
const RETURN_TEXT =
  "{4}{B}{B}, {T}: Put target creature card exiled with The Darkness Crystal onto the battlefield tapped under your control with two additional +1/+1 counters on it.";

export default defineCard({
  name: "The Darkness Crystal",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["artifact"],
  supertypes: ["legendary"],
  text: `${DISCOUNT_TEXT}\n${REPLACE_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["B"] }, caster: "you", reduceGeneric: 1 },
      text: DISCOUNT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", controlledBy: "opponent", token: false },
        linked: true,
        then: { kind: "gain-life", amount: 2 },
      },
      text: REPLACE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{B}{B}", tap: true },
      targets: [{ kind: "card-in-exile", linked: true, filter: { type: "creature" } }],
      effect: {
        kind: "put-onto-battlefield",
        target: 0,
        underYourControl: true,
        enterTapped: true,
        withCounters: { kind: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
