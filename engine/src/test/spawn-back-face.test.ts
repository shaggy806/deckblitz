import { expect, it } from "vitest";

import { printedCardName } from "../state.js";
import { A, spawn, table, toHand } from "./harness.js";

/**
 * `debugSpawn` by a back face's name: the card, with that face up on the
 * battlefield (rule 712.8a) — it used to make an object named for the back
 * face showing its front, which could do nothing.
 */
it("a back face spawned by name is that card with its back face up", () => {
  const { game } = table();
  const pools = spawn(game, "The Myriad Pools");
  const object = game.state.objects[pools];
  expect(object.cardName).toBe("The Everflowing Well");
  expect(printedCardName(object)).toBe("The Myriad Pools");
  const offered = game.legalActions(A).filter((a) => "source" in a && a.source === pools);
  expect(offered.map((a) => a.kind)).toContain("activate-ability");
});

it("in a hand it is the card, front face first", () => {
  const { game } = table();
  const card = toHand(game, "The Myriad Pools");
  expect(printedCardName(game.state.objects[card])).toBe("The Everflowing Well");
});
