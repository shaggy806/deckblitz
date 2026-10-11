import { crew } from "../helpers.js";
import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 14086.
//
// "Enters or attacks" is two triggers with one modal effect, its mode chosen
// as it's put on the stack (rule 700.2b). The graveyard mode needs a target
// to be chosen; the hand mode is a "may" made as it resolves.

const TRIGGER_TEXT = "Whenever this Vehicle enters or attacks, choose one —";
const HAND_MODE = "You may put a Hero creature card from your hand onto the battlefield.";
const GRAVEYARD_MODE = "Return target Hero creature card from your graveyard to your hand.";
const HERO_CREATURE = { type: "creature", subtype: "Hero" } as const;

const MODES: EffectSpec = {
  kind: "modal",
  announced: true,
  minModes: 1,
  maxModes: 1,
  modes: [
    {
      text: HAND_MODE,
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: HERO_CREATURE,
      },
    },
    {
      text: GRAVEYARD_MODE,
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: HERO_CREATURE }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
    },
  ],
};

const TEXT = `${TRIGGER_TEXT} ${HAND_MODE} ${GRAVEYARD_MODE}`;

export default defineCard({
  name: "Avengers Quinjet",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}\n• ${HAND_MODE}\n• ${GRAVEYARD_MODE}\nCrew 3`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: MODES, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: MODES, resolve: null, text: TEXT },
  ],
  activated: [crew(3)],
});
