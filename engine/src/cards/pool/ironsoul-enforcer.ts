import { defineCard } from "../define.js";

// EDHREC rank 6771.

export default defineCard({
  name: "Ironsoul Enforcer",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Samurai"],
  power: 4,
  toughness: 4,
  text: "Whenever this creature or a commander you control attacks alone, return target artifact card from your graveyard to the battlefield.",
  // Two entries, one ability: a commander Ironsoul Enforcer attacking alone
  // triggers it once, through the second.
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "self", filter: { isCommander: false } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: "Whenever this creature or a commander you control attacks alone, return target artifact card from your graveyard to the battlefield.",
    },
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { isCommander: true } },
      sameAbilityAs: 0,
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: "Whenever this creature or a commander you control attacks alone, return target artifact card from your graveyard to the battlefield.",
    },
  ],
});
