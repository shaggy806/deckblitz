/**
 * Worldgorger Dragon (`exile-all`'s `linked` and `exceptSource`, its leaves trigger's
 * `return-exiled-by-source`) and Darksteel Angel (Platinum Angel's lock plus `preventsCounters`).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, destroy, enter, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Worldgorger Dragon", () => {
  it("exiles every other permanent you control, and returns them as it leaves", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const dragon = enter(game, "Worldgorger Dragon");
    expect(zone(game, forest)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, dragon)).toBe("battlefield");
    destroy(game, dragon);
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("gone before its enters trigger resolves: the return finds nothing, the exile is for good", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const dragon = enter(game, "Worldgorger Dragon", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: dragon }]);
    settle(game);
    expect(zone(game, dragon)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Darksteel Angel", () => {
  it("your creatures get no -1/-1 counters, and you can't lose at 0 life", () => {
    const { game } = table();
    spawn(game, "Darksteel Angel");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 2 }, [{ kind: "object", object: bears }]);
    expect(game.state.objects[bears].counters["-1/-1"] ?? 0).toBe(0);
    game.debugApplyEffect(B, { kind: "lose-life", amount: 25, who: "each-opponent" });
    settle(game);
    expect(game.state.players[A].hasLost).toBe(false);
  });
});

describe("Abzan Charm", () => {
  it("distributes one counter to each of two targets, or both to one", () => {
    const { game } = table();
    for (const land of ["Plains", "Swamp", "Forest", "Plains", "Swamp", "Forest"]) spawn(game, land);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    cast(game, toHand(game, "Abzan Charm"), { modes: [2], targets: [ref(bears), ref(elves)] });
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(1);
    expect(game.state.objects[elves].counters["+1/+1"]).toBe(1);
    cast(game, toHand(game, "Abzan Charm"), { modes: [2], targets: [ref(bears), null] });
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(3);
  });

  it("draw two and lose 2 life", () => {
    const { game } = table();
    for (const land of ["Plains", "Swamp", "Forest"]) spawn(game, land);
    const before = game.state.zones.perPlayer[A].hand.length;
    cast(game, toHand(game, "Abzan Charm"), { modes: [1] });
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before + 2);
    expect(game.state.players[A].life).toBe(18);
  });
});
