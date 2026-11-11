import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Warhammer 40,000 Commander (40K). No engine code: the choices are Ultimate
// Magic: Meteor's `vote` with `about` — one question per opponent, the
// controller choosing as this resolves, none of them a target — and the one
// destroyed is Cinderheart Giant's random `choose-permanents` over what was
// chosen this way (rule 608.2d; one draw, each with an equal chance).
//
// Rulings:
//   If you choose one or more permanents with indestructible, and there are any permanents
//     chosen which do not have indestructible, one of the permanents without indestructible
//     will be randomly chosen and destroyed. (So the draw is among those that can be
//     destroyed; with every one indestructible, nothing is.)
const TEXT =
  "Battle Cannon — When this creature enters or dies, for each opponent, choose a nonland permanent that player controls. Destroy one of them chosen at random.";

const BATTLE_CANNON: EffectSpec = {
  kind: "sequence",
  effects: [
    {
      kind: "vote",
      choose: true,
      who: "you",
      for: {
        permanent: { notTypes: ["land"] },
        about: "each-opponent",
        prompt: "Choose a nonland permanent: one of those chosen is destroyed at random",
      },
    },
    {
      kind: "choose-permanents",
      random: true,
      filter: { thisWay: "chosen", notKeyword: "indestructible" },
      upTo: 1,
      prompt: "One of the chosen permanents, at random",
      then: { kind: "destroy", target: 0 },
    },
  ],
};

export default defineCard({
  name: "Chaos Defiler",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Demon", "Construct"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: BATTLE_CANNON, resolve: null, text: TEXT },
    { trigger: { on: "dies", who: "self" }, targets: [], effect: BATTLE_CANNON, resolve: null, text: TEXT },
  ],
});
