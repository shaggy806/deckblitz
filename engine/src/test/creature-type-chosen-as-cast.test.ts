/**
 * "As an additional cost to cast this spell, choose a creature type"
 * (Caller of the Hunt — `additionalCost.chooseCreatureType`): the type is
 * chosen as the cost is paid (rule 601.2h), before anyone gets priority, and
 * the permanent the spell becomes keeps it (rule 607.2j), read by its
 * `ofChosenType` count. A new object later — bounced and cast again, or a
 * copy — has a type only if one is chosen for it.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, lands, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("a creature type chosen as an additional cost", () => {
  it("Caller of the Hunt: asked as it's cast, kept on the creature, counting both sides' creatures", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    spawn(game, "Llanowar Elves");
    spawn(game, "Elvish Mystic", B);
    spawn(game, "Grizzly Bears");
    const caller = toHand(game, "Caller of the Hunt");
    cast(game, caller, { settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-creature-type");
    if (awaiting?.kind !== "choose-creature-type") return;
    expect(awaiting.player).toBe(A);
    expect(awaiting.prompt).toBe("Choose a creature type");
    // Every type is on offer, not just those on the battlefield.
    expect(awaiting.options).toContain("Dragon");
    expect(zone(game, caller)).toBe("stack");
    // Nobody has priority until it's chosen.
    expect(game.legalActions(B).some((la) => la.kind === "pass-priority")).toBe(false);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "Elf" });
    settle(game);
    expect(zone(game, caller)).toBe("battlefield");
    expect(game.state.objects[caller]!.chosenCreatureType).toBe("Elf");
    expect(pt(game, caller)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Elvish Visionary", B);
    expect(pt(game, caller)).toEqual({ power: 3, toughness: 3 });
  });

  it("Caller of the Hunt: choosing Human counts itself", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const caller = toHand(game, "Caller of the Hunt");
    cast(game, caller, { settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "Human" });
    settle(game);
    expect(zone(game, caller)).toBe("battlefield");
    expect(pt(game, caller)).toEqual({ power: 1, toughness: 1 });
  });

  it("Caller of the Hunt: put onto the battlefield without being cast, it has no type and counts nothing", () => {
    const { game } = table();
    spawn(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears");
    const caller = spawn(game, "Caller of the Hunt");
    expect(pt(game, caller)).toEqual({ power: 0, toughness: 0 });
  });

  it("Caller of the Hunt: the choice leaves with it — a new cast chooses again (rule 400.7)", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    spawn(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const caller = toHand(game, "Caller of the Hunt");
    cast(game, caller, { settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "Elf" });
    settle(game);
    expect(pt(game, caller)).toEqual({ power: 1, toughness: 1 });
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(caller)] });
    expect(zone(game, caller)).toBe("hand");
    expect(game.state.objects[caller]!.chosenCreatureType ?? null).toBe(null);
    cast(game, caller, { settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "Bear" });
    settle(game);
    expect(pt(game, caller)).toEqual({ power: 2, toughness: 2 });
  });
});
