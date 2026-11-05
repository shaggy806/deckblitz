import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

const HIDEAWAY_TEXT =
  "Hideaway 3, hideaway 3 (When this creature enters, look at the top three cards of your library, exile one face down, then put the rest on the bottom in a random order. Then do it again.)";
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, if there are cards exiled with it, you may play one of them without paying its mana cost.";

const HIDEAWAY_3: EffectSpec = {
  kind: "look-and-choose",
  zone: "library",
  count: 3,
  min: 1,
  max: 1,
  destination: "exile-face-down",
  leftover: "bottom-random",
};

export default defineCard({
  name: "Evercoat Ursine",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Bear"],
  power: 6,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${HIDEAWAY_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      // Two hideaway 3 abilities, each its own trigger (rule 702.75a).
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: HIDEAWAY_3,
      resolve: null,
      text: "Hideaway 3",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: HIDEAWAY_3,
      resolve: null,
      text: "Hideaway 3",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "exiled-with-source", atLeast: 1, now: true },
      targets: [],
      effect: { kind: "cast-now", from: "exiled-with-source", play: true, free: true },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
