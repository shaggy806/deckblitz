/**
 * Merieke Ri Berit: "{T}: Gain control of target creature for as long as you
 * control Merieke Ri Berit. When Merieke Ri Berit leaves the battlefield or
 * becomes untapped, destroy that creature. It can't be regenerated." No engine
 * code: The Pandorica's delayed trigger (a `becomes-untapped` watch of the
 * source, `once`, `orLeaves`), the control `whileYouControlSource`. Its
 * rulings: untapping it destroys the creature without first ending the
 * control; another player taking Merieke ends the control and fires nothing;
 * Merieke leaving ends the control, then destroys the creature.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, controller, destroy, nextTurn, ref, settle, spawn, table, zone } from "./harness.js";

const MERIEKE = "Merieke Ri Berit";

function stolen() {
  const seats = table();
  const merieke = spawn(seats.game, MERIEKE);
  const giant = spawn(seats.game, "Hill Giant", B);
  activate(seats.game, merieke, 0, { targets: [ref(giant)] });
  expect(controller(seats.game, giant)).toBe(A);
  expect(seats.game.state.objects[merieke].tapped).toBe(true);
  return { ...seats, merieke, giant };
}

const eventsDestroyed = (game: ReturnType<typeof table>["game"], id: string): boolean =>
  game.state.eventLog.some((e) => e.type === "permanent-destroyed" && e.object === id);

describe("Merieke Ri Berit", () => {
  it("doesn't untap in your untap step, so the creature stays yours", () => {
    const { game, merieke, giant } = stolen();
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[merieke].tapped).toBe(true);
    expect(controller(game, giant)).toBe(A);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("untapped by an effect: the creature is destroyed, still yours as it goes (the ruling)", () => {
    const { game, merieke, giant } = stolen();
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(merieke)]);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(eventsDestroyed(game, giant)).toBe(true);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("can't be regenerated", () => {
    const { game, merieke, giant } = stolen();
    game.debugApplyEffect(B, { kind: "regenerate", target: 0 }, [ref(giant)]);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(merieke)]);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Merieke leaving: the creature goes back to its owner, then is destroyed (the ruling)", () => {
    const { game, merieke, giant } = stolen();
    destroy(game, merieke);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[giant].owner).toBe(B);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("another player taking Merieke ends the control and destroys nothing (the ruling)", () => {
    const { game, merieke, giant } = stolen();
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(merieke)]);
    settle(game);
    expect(controller(game, merieke)).toBe(B);
    expect(controller(game, giant)).toBe(B);
    expect(zone(game, giant)).toBe("battlefield");
  });
});
