import { defineCard } from "../define.js";

// The cards are linked to this Koh's stint (rule 607.2a), and the choice is
// its: the last one chosen stands, its abilities gone while it's out of exile,
// until another is chosen. An ability naming that card means Koh (rule 201.5b).
const ENTER_TEXT = "When Koh enters, exile up to one other target creature.";
const DIES_TEXT = "Whenever another nontoken creature dies, you may exile it.";
const CHOOSE_TEXT = "Pay 1 life: Choose a creature card exiled with Koh.";
const GRANT_TEXT = "Koh has all activated and triggered abilities of the last chosen card.";

export default defineCard({
  name: "Koh, the Face Stealer",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Spirit"],
  power: 6,
  toughness: 6,
  text: `${ENTER_TEXT}\n${DIES_TEXT}\n${CHOOSE_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { token: false, type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile that creature card with Koh?",
        effect: { kind: "exile", target: "trigger-object", linked: true },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 1 },
      targets: [],
      effect: {
        kind: "choose-exiled-card",
        filter: { type: "creature" },
        prompt: "Choose a creature card exiled with Koh",
      },
      resolve: null,
      text: CHOOSE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "chosen-exiled", filter: {}, withTriggered: true },
      text: GRANT_TEXT,
    },
  ],
});
