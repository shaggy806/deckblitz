import { defineCard } from "../define.js";

const DELAYED =
  "When that creature dies this turn, return a creature card from its owner's graveyard to the battlefield under the control of that creature's owner.";

export default defineCard({
  name: "Reincarnation",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose target creature. ${DELAYED}`,
  targets: ["creature"],
  // The card returned isn't targeted, and may be the one that died. The
  // spell's controller chooses it as the delayed trigger resolves (it's their
  // trigger); it enters under its owner's control, the dead creature's owner,
  // since it comes from that player's graveyard.
  effect: {
    kind: "delayed-trigger",
    at: { leaves: 0, to: ["graveyard"], thisTurn: true },
    text: DELAYED,
    effect: {
      kind: "look-and-choose",
      from: { ownerOf: "trigger-object" },
      zone: "graveyard",
      min: 1,
      max: 1,
      filter: { type: "creature" },
      destination: "battlefield",
      under: "owners",
      leftover: "stay",
    },
  },
});
