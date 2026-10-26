import { defineCard } from "../define.js";

// EDHREC rank 5357.

/** Its last ability works while it's suspended (`whileSuspended`): a token
 * for every time counter that comes off, the last one included. */
export default defineCard({
  name: "Dinosaurs on a Spaceship",
  manaCost: "{4}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 7,
  toughness: 7,
  keywords: ["vigilance", "trample"],
  text: "Vigilance, trample\nOther Dinosaurs you control get +1/+1 and have vigilance and trample.\nSuspend 4—{3}{R}{W}\nWhenever a time counter is removed from this card while it's exiled, create a 2/2 red and white Dinosaur creature token with flying and haste.",
  suspend: { n: 4, cost: "{3}{R}{W}" },
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Dinosaur" },
      grantPt: [1, 1],
      grantKeywords: ["vigilance", "trample"],
      text: "Other Dinosaurs you control get +1/+1 and have vigilance and trample.",
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "time" },
      whileSuspended: true,
      targets: [],
      effect: { kind: "create-token", token: "2/2 Red and White Dinosaur Token (Flying, Haste)", count: 1 },
      resolve: null,
      text: "Whenever a time counter is removed from this card while it's exiled, create a 2/2 red and white Dinosaur creature token with flying and haste.",
    },
  ],
});
