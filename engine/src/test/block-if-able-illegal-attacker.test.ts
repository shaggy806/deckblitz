/**
 * "Target creature blocks target creature this turn if able" with the
 * creature to be blocked gone illegal as the spell resolves (rule 608.2b):
 * the requirement only names it, so while it's still on the battlefield the
 * other target still has to block it (Feral Contest's ruling). A blocker
 * gone illegal is under no requirement, and one that has left names nothing.
 */
import { blockRecords } from "./combat-probe.js";
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, blockOffer, cast, destroy, grant, lands, ref, settle, spawn, table, toHand } from "./harness.js";

const counters = (game: Game, id: ObjectId): number => game.state.objects[id]?.counters?.["+1/+1"] ?? 0;

describe("block if able, the attacker's slot gone illegal (rule 608.2b)", () => {
  it("Hunt Down: the first target has to block the second", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Hunt Down"), { targets: [ref(bears), ref(attacker)] });
    const offer = blockOffer(game, a, [attacker, other]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker }]);
  });

  it("Hunt Down: a second target that gained shroud is still the creature to block", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Hunt Down"), { targets: [ref(bears), ref(attacker)], settle: false });
    grant(game, attacker, "shroud");
    settle(game);
    const offer = blockOffer(game, a, [attacker, other]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker }]);
  });

  it("Hunt Down: a first target that gained shroud has nothing to obey", () => {
    const { game } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Hunt Down"), { targets: [ref(bears), ref(attacker)], settle: false });
    grant(game, bears, "shroud");
    settle(game);
    expect(blockRecords(game)).toEqual([]);
  });

  it("Hunt Down: a second target that left the battlefield names nothing (rule 400.7)", () => {
    const { game } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Hunt Down"), { targets: [ref(bears), ref(attacker)], settle: false });
    destroy(game, attacker);
    settle(game);
    expect(blockRecords(game)).toEqual([]);
  });

  it("Feral Contest: a counter on the first target, and the second has to block it", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Feral Contest"), { targets: [ref(mine), ref(theirs)] });
    expect(counters(game, mine)).toBe(1);
    const offer = blockOffer(game, a, [mine, other]);
    expect(offer.blockRequirements).toEqual([{ blocker: theirs, attacker: mine }]);
  });

  it("Feral Contest: a first target gone illegal gets no counter, but still has to be blocked", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Feral Contest"), { targets: [ref(mine), ref(theirs)], settle: false });
    grant(game, mine, "shroud");
    settle(game);
    expect(counters(game, mine)).toBe(0);
    const offer = blockOffer(game, a, [mine, other]);
    expect(offer.blockRequirements).toEqual([{ blocker: theirs, attacker: mine }]);
  });

  it("Feral Contest: a second target gone illegal doesn't have to block; the counter still lands", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Feral Contest"), { targets: [ref(mine), ref(theirs)], settle: false });
    grant(game, theirs, "shroud");
    settle(game);
    expect(counters(game, mine)).toBe(1);
    expect(blockRecords(game)).toEqual([]);
  });
});
