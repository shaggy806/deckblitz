/**
 * B338 (author-top-cards overnight), triggers-journal lane: Sacred Ground
 * (`leaves-battlefield.byEffectOf: "opponent"`; an edict's sacrifice,
 * chosen by the player, is still its spell's doing); Hibernation's End
 * (the `cumulative-upkeep-paid` event, announced by every way of paying);
 * Kodama of the Center Tree (`countOf.asSourceLeft`, a count its own
 * leaves-the-battlefield ability reads as the battlefield was); Keen-Eared
 * Sentry (a `venture` prohibition, counted from the journal's `ventured`).
 */
import { describe, expect, it } from "vitest";

import { playerHasKeyword } from "../characteristics.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

describe("Sacred Ground", () => {
  it("returns a land of yours an opponent's spell destroys", () => {
    const { game } = table();
    spawn(game, "Sacred Ground");
    const [plains] = lands(game, "Plains", 1);
    destroy(game, plains, B);
    expect(zone(game, plains)).toBe("battlefield");
    expect(game.state.objects[plains].controller).toBe(A);
  });

  it("leaves a land your own spell destroys, and an opponent's land, in the graveyard", () => {
    const { game } = table();
    spawn(game, "Sacred Ground");
    const [plains] = lands(game, "Plains", 1);
    const [swamp] = lands(game, "Swamp", 1, B);
    destroy(game, plains, A);
    destroy(game, swamp, A);
    expect(zone(game, plains)).toBe("graveyard");
    expect(zone(game, swamp)).toBe("graveyard");
  });

  it("returns a land sacrificed to an opponent's edict", () => {
    const { game, a } = table();
    spawn(game, "Sacred Ground");
    const [plains, forest] = [...lands(game, "Plains", 1), ...lands(game, "Forest", 1)];
    lands(game, "Mountain", 5, B);
    toStep(game, "precombat-main", B);
    const epicenter = toHand(game, "Epicenter", B);
    a.chooseSacrificesFn = () => [forest];
    const moves = game.state.objects[forest].zoneChangeCount ?? 0;
    cast(game, epicenter, { player: B, targets: [ref(A)] });
    settle(game);
    // Sacrificed, then back.
    expect(game.state.objects[forest].zoneChangeCount ?? 0).toBeGreaterThanOrEqual(moves + 2);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, plains)).toBe("battlefield");
  });

  it("doesn't see lethal damage's state-based action", () => {
    const { game } = table();
    spawn(game, "Sacred Ground");
    const arbor = spawn(game, "Dryad Arbor");
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 1 }, [ref(arbor)]);
    toStep(game, "begin-combat");
    expect(zone(game, arbor)).toBe("graveyard");
  });
});

describe("Hibernation's End", () => {
  it("paid, searches for a creature card with mana value exactly the age counters", () => {
    const { game, a } = table({ deck: "Island" });
    const end = spawn(game, "Hibernation's End");
    lands(game, "Forest", 3);
    const elves = toLibrary(game, "Llanowar Elves");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, elves);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, end, "age")).toBe(1);
    expect(zone(game, end)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
    expect(seen.offered).toContain(elves);
    expect(seen.offered).not.toContain(bears);
  });

  it("unpaid, it's sacrificed and searches for nothing", () => {
    const { game, a } = table({ deck: "Island" });
    const end = spawn(game, "Hibernation's End");
    lands(game, "Forest", 3);
    const elves = toLibrary(game, "Llanowar Elves");
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, end)).toBe("graveyard");
    expect(zone(game, elves)).toBe("library");
    expect(game.state.eventLog.some((e) => e.type === "cumulative-upkeep-paid")).toBe(false);
  });

  it("a cumulative upkeep paid by an act announces the payment too", () => {
    const { game, a } = table({ deck: "Island" });
    const lash = spawn(game, "Thought Lash");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, lash)).toBe("battlefield");
    expect(
      game.state.eventLog.some((e) => e.type === "cumulative-upkeep-paid" && e.object === lash && e.player === A),
    ).toBe(true);
  });
});

describe("Kodama of the Center Tree", () => {
  it("is as big as your Spirits, and soulshift X counts itself", () => {
    const { game, a } = table();
    const kodama = spawn(game, "Kodama of the Center Tree");
    spawn(game, "Hana Kami");
    expect(pt(game, kodama)).toEqual({ power: 2, toughness: 2 });
    const ancientLaw = toGraveyard(game, "Kami of Ancient Law");
    const falseHope = toGraveyard(game, "Kami of False Hope");
    const thief = toGraveyard(game, "Thief of Hope");
    const seen = watchTargets(a, (offered) => [offered[0]?.includes(ancientLaw) ? ancientLaw : null]);
    pickModes(a, 0);
    destroy(game, kodama);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([ancientLaw, falseHope]));
    expect(seen.offered[0]).not.toContain(thief);
    expect(zone(game, ancientLaw)).toBe("hand");
  });

  it("counts the Spirits that die with it, as the battlefield was", () => {
    const { game, a } = table();
    const kodama = spawn(game, "Kodama of the Center Tree");
    spawn(game, "Hana Kami");
    spawn(game, "Kami of False Hope");
    const thief = toGraveyard(game, "Thief of Hope");
    const seen = watchTargets(a, (offered) => [offered[0]?.includes(thief) ? thief : null]);
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } });
    settle(game);
    expect(zone(game, kodama)).toBe("graveyard");
    expect(seen.offered[0]).toContain(thief);
    expect(zone(game, thief)).toBe("hand");
  });
});

describe("Keen-Eared Sentry", () => {
  const ventures = (game: Game, player: PlayerId): number =>
    game.state.eventLog.filter((e) => e.type === "ventured" && e.player === player).length;
  const venture = (game: Game, player: PlayerId): void => {
    game.debugApplyEffect(player, { kind: "venture", into: "undercity" });
    settle(game);
  };

  it("lets each opponent venture once a turn, and its controller freely", () => {
    const { game } = table();
    spawn(game, "Keen-Eared Sentry");
    venture(game, B);
    venture(game, B);
    expect(ventures(game, B)).toBe(1);
    venture(game, A);
    venture(game, A);
    expect(ventures(game, A)).toBe(2);
    nextTurn(game);
    venture(game, B);
    expect(ventures(game, B)).toBe(2);
  });

  it("gives its controller hexproof", () => {
    const { game } = table();
    spawn(game, "Keen-Eared Sentry");
    expect(playerHasKeyword(game.state, game.registry, A, "hexproof")).toBe(true);
    expect(playerHasKeyword(game.state, game.registry, B, "hexproof")).toBe(false);
  });
});
