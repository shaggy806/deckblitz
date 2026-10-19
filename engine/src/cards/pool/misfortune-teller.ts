import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// A land creature card (Dryad Arbor) makes both a Rogue and a Treasure (the
// ruling); "otherwise" is a card that's neither.
const TRIGGER_TEXT =
  "Whenever this creature enters or deals combat damage to a player, exile target card from a graveyard. If it was a creature card, create a 2/2 black Rogue creature token. If it was a land card, create a Treasure token. Otherwise, you gain 3 life.";

const ability = (trigger: TriggeredAbility["trigger"]): TriggeredAbility => ({
  trigger,
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature" } },
        then: { kind: "create-token", token: "Rogue Token", count: 1 },
      },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "land" } },
        then: { kind: "create-token", token: "Treasure Token", count: 1 },
      },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { notTypes: ["creature", "land"] } },
        then: { kind: "gain-life", amount: 3 },
      },
    ],
  },
  resolve: null,
  text: TRIGGER_TEXT,
});

export default defineCard({
  name: "Misfortune Teller",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TRIGGER_TEXT}`,
  triggered: [
    ability({ on: "enters-battlefield", who: "self" }),
    ability({ on: "deals-combat-damage-to-player", who: "self" }),
  ],
});
