import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

const GRANTED_TEXT =
  "When this creature enters and at the beginning of your upkeep, each player may put two +1/+1 counters on a creature they control. For each opponent who does, you gain protection from that player until your next turn.";

// Each player's "may" is theirs (`you` inside `effect` is them); the follow-up
// is the commander's controller's, once per opponent who did.
const EFFECT: TriggeredAbility["effect"] = {
  kind: "each-player-may",
  who: "each-player",
  prompt: "Put two +1/+1 counters on a creature you control?",
  effect: {
    kind: "choose-permanents",
    filter: { type: "creature", controlledBy: "you" },
    min: 1,
    upTo: 1,
    prompt: "Choose a creature you control to put two +1/+1 counters on",
    then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
  },
  resultsFor: "each-opponent",
  ifDid: {
    kind: "player-effect",
    duration: "until-your-next-turn",
    protectionFromPlayers: { who: "you", from: "that-player" },
  },
};

export default defineCard({
  name: "Noble Heritage",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: `Commander creatures you own have "${GRANTED_TEXT}" (You can't be targeted, dealt damage, or enchanted by anything controlled by that player.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: EFFECT,
          resolve: null,
          text: GRANTED_TEXT,
        },
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: EFFECT,
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Commander creatures you own have "${GRANTED_TEXT}"`,
    },
  ],
});
