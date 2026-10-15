import { defineCard } from "../define.js";

// EDHREC rank 7467. Final Fantasy.
//
// Rulings:
//   [2025-06-06] You can't use Barret's last ability to try to attach an Equipment to a Rebel if
//     that Equipment can't legally be attached to that Rebel.
//
// The Mighty Thor's Equipment trigger making a 2/2 Rebel, and Blacksmith's
// Talent's combat attach with the optional slot on the Equipment instead. An
// Equipment that can't legally go onto the Rebel stays where it is (rule
// 301.5c — `attach`).
const AVALANCHE_TEXT = "Avalanche! — Whenever an Equipment you control enters, create a 2/2 red Rebel creature token.";
const ATTACH_TEXT =
  "At the beginning of combat on your turn, attach up to one target Equipment you control to target Rebel you control.";

export default defineCard({
  name: "Barret, Avalanche Leader",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${AVALANCHE_TEXT}\n${ATTACH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Equipment" } },
      targets: [],
      effect: { kind: "create-token", token: "Rebel Token", count: 1 },
      resolve: null,
      text: AVALANCHE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [
        { kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtype: "Equipment" } } },
        { kind: "permanent", whose: "you", filter: { subtype: "Rebel" } },
      ],
      effect: { kind: "attach", target: 1, attachment: 0 },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
});
