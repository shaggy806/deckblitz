/**
 * "Exile … until ~ leaves the battlefield" (rule 610.3): the return is a second one-shot effect
 * created right after the source leaves — not a triggered ability. So nothing goes on the stack
 * for it, it happens though the source lost its abilities, the card comes back under its owner's
 * control, everything returning from one event returns together (610.3d), and a token exiled this
 * way has ceased to exist.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, controller, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("exile until this leaves the battlefield (rule 610.3)", () => {
  it("returns the card right after the source leaves, with nothing on the stack", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Banishing Light"));
    expect(zone(game, bears)).toBe("exile");
    const light = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Banishing Light")!;
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(light)]);
    // No settle: the return isn't waiting on the stack.
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("returns it though the source has lost its abilities", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Banishing Light"));
    const light = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Banishing Light")!;
    game.state.timestampSeq += 1;
    game.state.objects[light].modifiers.push({
      power: 0,
      toughness: 0,
      keywords: [],
      untilEndOfTurn: false,
      loseAbilities: true,
      timestamp: game.state.timestampSeq,
    });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(light)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("brings back nothing for an exiled token, and the card isn't caught by the wrath that took the source", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Banishing Light"));
    expect(zone(game, bears)).toBe("exile");
    // A wrath takes the Light: the Bears return after the event, so it isn't destroyed.
    game.debugApplyEffect(B, { kind: "destroy-all", filter: {} });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");

    const { game: g2 } = table();
    g2.debugApplyEffect(B, { kind: "create-token", token: "Spirit Token", count: 1 });
    settle(g2);
    const spirit = g2.state.zones.shared.battlefield.find((id) => g2.state.objects[id].cardName === "Spirit Token")!;
    lands(g2, "Plains", 3);
    cast(g2, toHand(g2, "Banishing Light"), { targets: [] });
    expect(g2.state.objects[spirit]?.zone ?? "gone").not.toBe("battlefield");
    const light = g2.state.zones.shared.battlefield.find((id) => g2.state.objects[id].cardName === "Banishing Light")!;
    g2.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(light)]);
    settle(g2);
    expect(g2.state.zones.shared.battlefield.some((id) => g2.state.objects[id].cardName === "Spirit Token")).toBe(false);
  });

  it("a card that left exile some other way doesn't come back", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Banishing Light"));
    const light = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Banishing Light")!;
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "exile" }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(light)]);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    void spawn;
  });
});
