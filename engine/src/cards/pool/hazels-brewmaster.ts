import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// The exiled cards are linked to this creature (rule 607.2a), so a Food reads
// them only while this stint lasts, and "creature cards" leaves the rest out:
// any card may be exiled. A Food's own "{2}, {T}, Sacrifice this artifact" stays
// its own; an ability naming the exiled card means the Food (rule 201.5b).
const TRIGGER_TEXT =
  "Whenever this creature enters or attacks, exile up to one target card from a graveyard and create a Food token.";
const GRANT_TEXT = "Foods you control have all activated abilities of all creature cards exiled with this creature.";

const exileAndFood = (on: "enters-battlefield" | "attacks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0, linked: true },
      { kind: "create-token", token: "Food Token", count: 1 },
    ],
  },
  resolve: null,
  text: TRIGGER_TEXT,
});

export default defineCard({
  name: "Hazel's Brewmaster",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Squirrel", "Warlock"],
  power: 3,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${TRIGGER_TEXT}\n${GRANT_TEXT}`,
  triggered: [exileAndFood("enters-battlefield"), exileAndFood("attacks")],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Food", controlledBy: "you" } },
      grantsActivatedOf: { zone: "exiled-with", filter: { type: "creature" } },
      text: GRANT_TEXT,
    },
  ],
});
