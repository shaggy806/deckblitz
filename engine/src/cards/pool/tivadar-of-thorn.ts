import { defineCard } from "../define.js";

// EDHREC rank 26900.

export default defineCard({
  name: "Tivadar of Thorn",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike, protection from red\nWhen Tivadar enters, destroy target Goblin.",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Goblin" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When Tivadar enters, destroy target Goblin.",
    },
  ],
});
